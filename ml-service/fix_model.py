"""
Script to properly re-save the pickle model to avoid class loading issues

Run this script if you have the original model training code and want to
re-save the model in a compatible format.
"""
import pickle
import joblib
from pathlib import Path

# Define your custom model class here (copy from your training code)
class ComplexTrapModelRenamed:
    """
    Your custom model class.
    Replace this with the actual implementation from your training code.
    """
    def __init__(self):
        self.model = None
    
    def predict(self, X):
        if self.model is not None:
            return self.model.predict(X)
        raise NotImplementedError("Model not initialized")

def load_old_model():
    """Load the existing pickle file"""
    model_path = Path(__file__).parent / 'complex_price_model_v2.pkl'
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print(f"✅ Successfully loaded model from {model_path}")
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

def save_model_with_joblib(model, output_path='complex_price_model_v2_joblib.pkl'):
    """Save model using joblib for better compatibility"""
    try:
        joblib.dump(model, output_path)
        print(f"✅ Model saved with joblib to {output_path}")
    except Exception as e:
        print(f"❌ Error saving model: {e}")

if __name__ == '__main__':
    print("=" * 60)
    print("Model Re-saving Utility")
    print("=" * 60)
    
    # Try to load the existing model
    model = load_old_model()
    
    if model is not None:
        print(f"\nModel type: {type(model)}")
        print(f"Model attributes: {dir(model)}")
        
        # Option 1: Save with joblib
        save_model_with_joblib(model)
        
        print("\n" + "=" * 60)
        print("Next steps:")
        print("1. Update app.py to use joblib.load() instead of pickle.load()")
        print("2. Or ensure the ComplexTrapModelRenamed class matches your training code")
        print("=" * 60)
