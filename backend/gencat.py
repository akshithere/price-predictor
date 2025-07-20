import pandas as pd
import json

# Load dataset
df = pd.read_csv("Cleaned_Car_data.csv")

# Normalize whitespace and strip text
df['company'] = df['company'].astype(str).str.strip()
df['name'] = df['name'].astype(str).str.strip()
df['fuel_type'] = df['fuel_type'].astype(str).str.strip()

# Extract unique values
companies = sorted(df['company'].unique())
fuel_types = sorted(df['fuel_type'].unique())

# For model names, use full names (not just first word)
models = sorted(df['name'].unique())

# Create model-company mapping
model_company_pairs = sorted(
    [{"name": row['name'], "company": row['company']} for _, row in df[['name', 'company']].drop_duplicates().iterrows()],
    key=lambda x: (x['company'], x['name'])
)

# Final structure
categories = {
    "company": companies,
    "model": models,
    "fuel_type": fuel_types,
    "model_company": model_company_pairs
}

# Save to file
with open("unique_categories.json", "w") as f:
    json.dump(categories, f, indent=2)
