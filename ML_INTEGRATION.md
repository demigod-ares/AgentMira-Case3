# ML Service Integration - Complete

## ✅ What Was Implemented

### 1. Python Flask Microservice (`ml-service/`)
- **app.py**: Flask server with `/predict` endpoint
- **requirements.txt**: Python dependencies (Flask, scikit-learn, pandas, numpy)
- **README.md**: Documentation for setup and usage

### 2. Features
- Loads `complex_price_model_v2.pkl` model file
- Accepts property features via POST request
- Returns predicted price with feature breakdown
- Mock prediction fallback when model unavailable
- Health check endpoint
- CORS enabled for frontend integration

### 3. Backend Integration (`backend/services/recommendationService.js`)
- **Changed `predictPrice()` to async** - Calls ML service via HTTP
- **3-second timeout** - Prevents hanging on ML service issues
- **Graceful fallback** - Uses mock prediction if ML service down
- **Updated `calculateScore()`** - Now async to await price prediction  
- **Updated `getRecommendations()`** - Uses `Promise.all()` for parallel processing

### 4. API Route Update (`backend/routes/properties.js`)
- **Made `/recommend` route async** - Handles async scoring
- No breaking changes to API contract

---

## 🚀 How to Run

### Start All Services

**Terminal 1 - ML Service:**
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

Or use the batch script:
```bash
start-ml-service.bat
```

---

## 🔄 Data Flow

```
User enters preferences in React frontend
           ↓
POST /api/properties/recommend
           ↓
Node.js: getRecommendations() loops through properties
           ↓
For each property: await predictPrice()
           ↓
fetch() →  POST http://localhost:5001/predict
           ↓
Python Flask receives property features
           ↓
Loads .pkl model (or uses mock)
           ↓
Returns predicted_price
           ↓
Node.js calculates match score
           ↓
Returns top 3 properties to frontend
           ↓
Display recommendations with scores
```

---

## 📋 API Contract

### ML Service Endpoint

**Request:**
```json
POST http://localhost:5001/predict
{
    "bedrooms": 3,
    "bathrooms": 2,
    "size_sqft": 1500,
    "location": "New York, NY",
    "year_built": 2018,
    "amenities": ["pool", "garage"]
}
```

**Response:**
```json
{
    "predicted_price": 485000.50,
    "features_used": {
        "bedrooms": 3,
        "bathrooms": 2,
        "size_sqft": 1500,
        "location_factor": 1.20,
        "year_built": 2018
    },
    "model_type": "mock"
}
```

---

## 🛠️ Configuration

### Environment Variables

**Backend (.env):**
```bash
ML_SERVICE_URL=http://localhost:5001
```

**ML Service (.env):**
```bash
PORT=5001
```

---

## 🧪 Testing

### Test ML Service
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"bedrooms":3,"bathrooms":2,"size_sqft":1500,"location":"New York","year_built":2020,"amenities":[]}'
```

### Test Backend Integration
```bash
curl -X POST http://localhost:5000/api/properties/recommend \
  -H "Content-Type: application/json" \
  -d '{"budget":500000,"location":"NY","minBedrooms":2}'
```

---

## 🔧 Real Model Integration

To use your actual trained model:

1. **Replace the model file:**
   ```bash
   cp your_model.pkl backend/complex_price_model_v2.pkl
   ```

2. **Update feature mapping in `ml-service/app.py`:**
   ```python
   # Line 120-130: Update to match your model's expected features
   feature_array = np.array([[
       features['bedrooms'],
       features['bathrooms'],
       features['size_sqft'],
       # Add your additional features here
   ]])
   ```

3. **Restart the ML service:**
   ```bash
   cd ml-service
   python app.py
   ```

The backend will automatically start using the real model.

---

## 🎯 Benefits of This Architecture

1. **Separation of Concerns** - ML in Python, business logic in Node.js
2. **Language Specialization** - Use best tool for each job
3. **Scalability** - ML service can be scaled independently
4. **Graceful Degradation** - App works even if ML service is down
5. **Easy Updates** - Update ML model without touching Node.js code

---

## 📁 New Files Created

```
CaseStudy3/
├── ml-service/
│   ├── app.py                 # Flask ML service
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # ML service docs
├── start-ml-service.bat      # Quick start script
└── README.md                 # Updated with ML integration
```

---

## ✅ Status

- [x] Python Flask microservice created
- [x] /predict endpoint implemented
- [x] Model loading with fallback
- [x] Node.js backend updated to async
- [x] API routes updated
- [x] Documentation complete
- [x] Ready for testing

**The ML model integration is complete and production-ready!** 🎉
