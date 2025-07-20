from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Set
import joblib
import pandas as pd
import json
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="Car Price Prediction API",
    description="API for predicting used car prices based on various features",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
MODEL_PATH = Path(__file__).parent / "XG_boostModel.pkl"
CATEGORIES_PATH = Path(__file__).parent / "unique_categories.json"

# Global variables to store model and categories
model = None
categories = {}

class CategoryCache:
    _instance = None
    _categories = None
    
    @classmethod
    def get_categories(cls) -> dict:
        if cls._categories is None:
            if not CATEGORIES_PATH.exists():
                return {}
            with open(CATEGORIES_PATH, 'r') as f:
                cls._categories = json.load(f)
        return cls._categories
    
    @classmethod
    def get_valid_values(cls, field: str) -> Set[str]:
        cats = cls.get_categories()
        return set(cats.get(field, []))

def get_model():
    global model
    if model is None and MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
    return model

@app.on_event("startup")
async def startup_event():
    # Preload the model and categories
    get_model()
    # Preload categories
    CategoryCache.get_categories()
    print("API startup complete. Model and categories loaded.")

class CarPredictionInput(BaseModel):
    company: str = Field(..., description="Car manufacturer (e.g., 'Maruti', 'Hyundai')")
    name: str = Field(..., description="Car model (e.g., 'Swift', 'Creta')")
    year: int = Field(..., ge=1990, le=2025, description="Year of manufacture (1990-2025)")
    kms_driven: int = Field(..., ge=0, le=1000000, description="Kilometers driven (0-1,000,000)")
    fuel_type: str = Field(..., description="Type of fuel (e.g., 'Petrol', 'Diesel', 'CNG')")
    
    @validator('company', 'name', 'fuel_type')
    def validate_categories(cls, v, values, field):
        valid_values = CategoryCache.get_valid_values(field.name)
        if not valid_values:
            return v
            
        # Case-insensitive comparison
        v_lower = v.lower()
        for valid in valid_values:
            if valid.lower() == v_lower:
                # Return the canonical version (with correct case)
                return valid
                
        # If we get here, the value wasn't found
        valid_options = ", ".join(sorted(valid_values))
        if len(valid_options) > 200:  # Don't show all options if there are too many
            valid_options = f"{len(valid_values)} valid options available. Use /categories endpoint to see all."
            
        raise ValueError(
            f"Invalid {field.name}: '{v}'. "
            f"Must be one of: {valid_options}"
        )

class PredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Predicted price in INR")
    status: str = Field(..., description="Status of the prediction")
    message: str = Field("", description="Additional information about the prediction")

class ModelInfo(BaseModel):
    name: str
    company: str

class CategoryResponse(BaseModel):
    companies: List[str]
    models: List[ModelInfo]  # Now includes company info with each model
    fuel_types: List[str]

# Health check endpoint
@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "categories_loaded": bool(CategoryCache.get_categories())
    }

# Get available categories
@app.get("/categories", response_model=CategoryResponse, tags=["Info"])
async def get_categories():
    cats = CategoryCache.get_categories()
    if not cats:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Category information not loaded. Please try again later."
        )
    
    # Use the saved model-company relationships if available
    if 'model_company' in cats and cats['model_company']:
        model_infos = cats['model_company']
    else:
        # Fallback: Create model info objects with company relationships
        model_infos = []
        for model_name in cats.get('model', []):
            # Try to find a company that matches the model name
            company = next((c for c in cats.get('company', []) if c.lower() in model_name.lower()), 'Other')
            model_infos.append({"name": model_name, "company": company})
    
    return CategoryResponse(
        companies=sorted(cats.get('company', [])),
        models=model_infos,
        fuel_types=sorted(cats.get('fuel_type', []))
    )

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_price(car_input: CarPredictionInput):
    model = get_model()
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Please try again later."
        )
    
    try:
        # Convert input to DataFrame for prediction
        input_df = pd.DataFrame([car_input.dict()])
        print('input_df is: ', input_df)
        # Make prediction
        predicted_price = model.predict(input_df)[0]
        
        # Ensure price is not negative
        predicted_price = max(0, float(predicted_price))
        
        return {
            "predicted_price": round(predicted_price, 2),
            "status": "success",
            "message": "Prediction successful"
        }
        
    except Exception as e:
        error_msg = f"Prediction failed: {str(e)}"
        print(error_msg)
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Prediction failed",
                "details": str(e),
                "suggestion": "Please check that the input data matches the expected format and categories."
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
