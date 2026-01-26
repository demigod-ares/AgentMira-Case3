from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Define the custom model class that was used during training
# This must match the class used when the model was pickled
class ComplexTrapModelRenamed:
    """
    Placeholder class for the custom model.
    This should match the actual model class from training.
    If you have the original training code, copy the class definition here.
    """
    def __init__(self):
        self.model = None
    
    def predict(self, X):
        """Predict method - implement based on your actual model"""
        if self.model is not None:
            return self.model.predict(X)
        raise NotImplementedError("Model not properly initialized")

# Load the ML model
MODEL_PATH = Path(__file__).parent / 'complex_price_model_v2.pkl'

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"⚠️ Model file not found at {MODEL_PATH}. Will be using mock predictions.")
    model = None
except Exception as e:
    print(f"⚠️ Error loading model: {e}. Will be using mock predictions.")
    model = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict property price based on features
    
    Expected JSON payload:
    {
        "bedrooms": 3,
        "bathrooms": 2,
        "size_sqft": 1500,
        "location": "New York, NY",
        "year_built": 2018,
        "amenities": ["pool", "garage"]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract features
        features = {
            'bedrooms': data.get('bedrooms', 2),
            'bathrooms': data.get('bathrooms', 2),
            'size_sqft': data.get('size_sqft', 1500),
            'year_built': data.get('year_built', 2015),
            'location': data.get('location', ''),
            'amenities': data.get('amenities', [])
        }
        
        # Calculate location factor (simple mapping)
        location_factors = {
            'new york': 1.20,
            'san francisco': 1.25,
            'los angeles': 1.15,
            'miami': 1.10,
            'chicago': 1.05,
            'boston': 1.15,
            'seattle': 1.12,
            'austin': 0.95,
            'dallas': 0.92
        }
        
        location_lower = features['location'].lower()
        location_factor = 1.0
        for city, factor in location_factors.items():
            if city in location_lower:
                location_factor = factor
                break
        
        features['location_factor'] = location_factor
        
        if model is not None:
            try:
                # Prepare features for model (adjust based on actual model requirements)
                # This is a placeholder - adjust according to your actual model's expected input
                feature_array = np.array([[
                    features['bedrooms'],
                    features['bathrooms'],
                    features['size_sqft'],
                    features['location_factor'],
                    features['year_built']
                ]])
                
                predicted_price = float(model.predict(feature_array)[0])
            except Exception as e:
                print(f"Model prediction error: {e}. Falling back to mock.")
                return jsonify({'error': 'Model prediction error'}), 500
        else:
            return jsonify({'error': 'Model not loaded'}), 500
        
        return jsonify({
            'predicted_price': round(predicted_price, 2),
            'features_used': {
                'bedrooms': features['bedrooms'],
                'bathrooms': features['bathrooms'],
                'size_sqft': features['size_sqft'],
                'location_factor': location_factor,
                'year_built': features['year_built']
            },
            'model_type': 'real' if model is not None else 'mock'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 ML Service starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
