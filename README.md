# 🏠 PropertyAI - AI-Powered Real Estate Chatbot

A full-stack property recommendation system that helps users find their dream home based on their preferences. Built with React, Node.js, Express, and MongoDB.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-8-brightgreen)

## ✨ Features

- **AI-Powered Recommendations**: Get personalized property matches with ML-based scoring
- **Smart Chatbot Interface**: Interactive chat experience for preference input
- **6-Factor Scoring Algorithm**: Properties scored on price, bedrooms, schools, commute, age, and amenities
- **Property Comparison**: Compare up to 3 properties side-by-side
- **Save Favorites**: Store preferred properties in MongoDB
- **Premium Dark UI**: Modern glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (for ML service)
- MongoDB (local or Atlas) - *optional for saved properties*

### Installation

1. **Clone and navigate to project**
```bash
cd CaseStudy3
```

2. **Start the backend** (new terminal)
```bash
net start MongoDB
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

3. **Start the frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:5173

### 🌐 Deploy with Cloudflare Tunnel (Optional)

Expose your app publicly using Cloudflare Tunnel with path-based routing (no CORS issues):

**Manual Start:**
```powershell
# 1. Start backend (terminal 1)
cd backend
npm run start

# 2. Start frontend (terminal 2)
cd frontend
npm run dev

# 3. Start tunnel (terminal 3)
cloudflared tunnel --url http://localhost:5173 --config C:\Codes\9AIPython\companies\AgentMira\CaseStudy3\config.yml
```

The tunnel will provide a public URL (e.g., `https://random-words.trycloudflare.com`) that:
- Routes `/` to frontend (localhost:5173)
- Routes `/api/*` to backend (localhost:5000)
- Eliminates CORS issues through path-based routing

📖 **See `.agent/workflows/run-with-tunnel.md` for detailed setup and troubleshooting**


## 📐 Recommendation Algorithm

Each property receives a weighted match score (0-100):

```
total_score = 
    0.30 × price_match_score +
    0.20 × bedroom_score +
    0.15 × school_rating_score +
    0.15 × commute_score +
    0.10 × property_age_score +
    0.10 × amenities_score
```

### Scoring Components

| Component | Weight | Logic |
|-----------|--------|-------|
| **Price Match** | 30% | 100 if within budget, decreases linearly above |
| **Bedrooms** | 20% | 100 if meets min requirement |
| **School Rating** | 15% | (rating / 10) × 100 |
| **Commute** | 15% | 100 (≤15min), 80 (≤30), 50 (≤45), 20 (>45) |
| **Property Age** | 10% | 100 (≤5yr), 80 (≤15), 60 (≤30), 40 (>30) |
| **Amenities** | 10% | % of [pool, garage, garden] present |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all merged properties |
| POST | `/api/properties/recommend` | Get top 3 recommendations |
| POST | `/api/properties/save` | Save a property |
| GET | `/api/properties/saved` | Get saved properties |
| DELETE | `/api/properties/saved/:id` | Remove saved property |
| GET | `/api/health` | Health check |

### Example Request
```bash
curl -X POST http://localhost:5000/api/properties/recommend \
  -H "Content-Type: application/json" \
  -d '{"budget": 500000, "location": "NY", "minBedrooms": 2}'
```

## 📁 Project Structure

```
CaseStudy3/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/properties.js   # API routes
│   ├── services/
│   │   ├── propertyService.js     # Data merging
│   │   └── recommendationService.js  # ML scoring
│   └── models/SavedProperty.js  # MongoDB schema
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app
│   │   ├── index.css          # Premium styling
│   │   └── components/
│   │       ├── ChatBot.jsx
│   │       ├── PropertyCard.jsx
│   │       └── PropertyComparison.jsx
└── resources/                  # Data sources
    ├── property_basics.json
    ├── property_characteristics.json
    └── property_images.json
```

## 🎯 ML Model Integration

The application uses a **Python Flask microservice** for real ML model predictions:

### Architecture
```
Node.js Backend → HTTP Request → Python ML Service (Flask)
                                    ↓
                            Loads .pkl model
                                    ↓
                            Returns prediction
```

### Implementation
- **Service**: `ml-service/app.py` - Flask server on port 5001
- **Endpoint**: `POST /predict` - Accepts property features, returns predicted price
- **Fallback**: If ML service is unavailable, Node.js uses mock prediction algorithm
- **Async**: Node.js backend uses `async/await` with 3-second timeout

### Real Model Integration
To integrate your actual `.pkl` model:
1. Replace `complex_price_model_v2.pkl` with your trained model
2. Update feature mapping in `ml-service/app.py` line 120-125
3. Restart ML service: `python ml-service/app.py`

The backend will automatically use the real model if available.

## 🛡️ Error Handling

- **Graceful MongoDB fallback**: App works without MongoDB (saved properties disabled)
- **API error responses**: Consistent JSON error format
- **Frontend error boundaries**: Failed API calls display user-friendly messages

## 📄 License
MIT
