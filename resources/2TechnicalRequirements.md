# 🏗️ Senior Case Study: AI-Powered Property Recommendation System

Welcome! This case study is designed to evaluate your ability to design, develop, and scale an AI-powered full stack application for Agent Mira.

---

## 🎯 Objective

Build a working MVP of a property recommendation system where users enter home-buying preferences and receive 2–3 personalized property suggestions, each with reasoning. A core requirement is the **integration and usage of the provided ML model (`complex_price_model_v2.pkl`)** to score and rank the properties.

---

## 🔧 Core Tasks

### 1. Prototype Application

- Design and build a basic full stack app that:
  - Accepts user preferences (budget, location, min bedrooms, etc.)
  - Fetches or simulates a list of properties (you may mock data)
  - Uses the provided model to predict property prices
  - Applies the recommendation logic (see below)
  - Returns top 3 matches with reasoning

### 2. Architecture & Design Document

Prepare a short document or presentation covering:

#### 🧱 Architecture for Two Scenarios:

- **Scenario A**: 1,000 users per day
- **Scenario B**: 20,000 users per day

Explain how your architecture would evolve from A to B:
- Frontend/backend design
- Database/storage strategy
- Caching, load balancing, and auto-scaling
- Model/AI serving approach (batch vs real-time)
- Deployment and CI/CD strategy

### 3. Monitoring, Logging, and Error Handling

Include details on:
- Error monitoring and performance tracking in production
- Alerting strategy for failures
- Retry logic and graceful degradation

---

## 📐 Recommendation Logic

Each property receives a **total match score (0–100)** calculated from:

```python
total_score = (
    0.3 * price_match_score +
    0.2 * bedroom_score +
    0.15 * school_rating_score +
    0.15 * commute_score +
    0.1 * property_age_score +
    0.1 * amenities_score
)
```

### Component Breakdown:

- `price_match_score`: 
```python
if predicted_price <= user_budget:
    score = 100
else:
    score = max(0, 100 - ((predicted_price - user_budget) / user_budget) * 100)
```

- `bedroom_score`: 
```python
if property_bedrooms >= user_min_bedrooms:
    score = 100
else:
    score = (property_bedrooms / user_min_bedrooms) * 100
```

- `school_rating_score`: 
```python
score = (school_rating / 10) * 100
```

- `commute_score`: 
```python
if commute_time <= 15: score = 100
elif commute_time <= 30: score = 80
elif commute_time <= 45: score = 50
else: score = 20
```

- `property_age_score`: 
```python
age = current_year - year_built
if age <= 5: score = 100
elif age <= 15: score = 80
elif age <= 30: score = 60
else: score = 40
```

- `amenities_score`: 
```python
features = [has_pool, has_garage, has_garden]
score = (sum(features) / 3) * 100
```

Your task is to calculate `total_score` for each property and return the top 3, including a short reasoning per property.

---

## 🧠 What We’re Evaluating

| Area                      | What We're Looking For                            |
|---------------------------|---------------------------------------------------|
| Technical Depth           | Code quality, architectural reasoning             |
| Design Thinking           | Scalable and modular system design                |
| ML Model Integration      | Proper model usage and scoring implementation     |
| Product Judgment          | Ability to prioritize user needs and tradeoffs    |
| Error Resilience          | Logging, alerts, graceful fallback                |

---

## ✅ Submission Instructions

Please submit:
- GitHub repo (or zipped folder) with your working prototype
- A PDF or slide deck containing your architecture and scaling plan
- A `README.md` with:
  - Setup instructions
  - Explanation of how your system implements the recommendation logic
