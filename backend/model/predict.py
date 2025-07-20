import os
import sys
import pickle
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the model when the application starts
model_path = os.path.join(os.path.dirname(__file__), 'XG_boostModel.pkl')
model = None

# Load the model
try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Error loading model: {e}", file=sys.stderr)
    sys.exit(1)

# Feature mapping (adjust according to your model's requirements)
COMPANIES = [
    'Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 
    'Toyota', 'Kia', 'Volkswagen', 'Renault', 'Skoda'
]

FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Extract and validate input data
        company = data.get('company')
        name = data.get('name')
        year = int(data.get('year', 0))
        kms_driven = float(data.get('kms_driven', 0))
        fuel_type = data.get('fuel_type')
        
        # Basic validation
        if not all([company, name, year, kms_driven, fuel_type]):
            return jsonify({"error": "Missing required fields"}), 400
            
        if company not in COMPANIES:
            return jsonify({"error": "Invalid company"}), 400
            
        if fuel_type not in FUEL_TYPES:
            return jsonify({"error": "Invalid fuel type"}), 400
        
        # Prepare features for prediction
        # Note: You'll need to adjust this based on how your model was trained
        features = {
            'company': company,
            'name': name,
            'year': year,
            'kms_driven': kms_driven,
            'fuel_type': fuel_type
        }
        
        # Convert features to the format expected by your model
        # This is a placeholder - adjust according to your model's requirements
        X = [
            COMPANIES.index(company),
            year,
            kms_driven,
            FUEL_TYPES.index(fuel_type)
            # Add other features as needed
        ]
        
        # Make prediction
        prediction = model.predict([X])[0]
        
        return jsonify({
            'prediction': float(prediction),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
