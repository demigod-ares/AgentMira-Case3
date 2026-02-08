const CURRENT_YEAR = new Date().getFullYear();

function mockPredictPrice(property) {
    const basePrice = property.price;

    // Simulated ML adjustment factors
    const locationMultiplier = getLocationMultiplier(property.location);
    const sizeMultiplier = property.size_sqft / 1500; // Normalized to average size
    const bedroomFactor = 1 + (property.bedrooms - 2) * 0.05;
    const amenityFactor = 1 + (property.amenities?.length || 0) * 0.02;
    const ageFactor = getAgeFactor(property.year_built);

    // Predicted price with small variance from actual (simulating ML uncertainty)
    const predictedPrice = basePrice * sizeMultiplier * locationMultiplier * bedroomFactor * amenityFactor * ageFactor;

    // Add small random variance (±5%) to simulate ML prediction
    const variance = 0.95 + Math.random() * 0.1;

    return Math.round(predictedPrice * variance);
}

function getLocationMultiplier(location) {
    const multipliers = {
        'new york': 1.15,
        'san francisco': 1.20,
        'los angeles': 1.10,
        'miami': 1.05,
        'austin': 0.95,
        'dallas': 0.92,
        'chicago': 1.00,
        'seattle': 1.08,
        'boston': 1.12
    };

    const loc = location.toLowerCase();
    for (const [city, mult] of Object.entries(multipliers)) {
        if (loc.includes(city)) return mult;
    }
    return 1.0;
}

function getAgeFactor(yearBuilt) {
    if (!yearBuilt) return 1.0;
    const age = CURRENT_YEAR - yearBuilt;
    if (age <= 2) return 1.05;
    if (age <= 5) return 1.02;
    if (age <= 10) return 1.0;
    if (age <= 20) return 0.95;
    return 0.90;
}

/**
 * Calculate recommendation score based on the specified algorithm
 */
function calculateScore(property, preferences) {
    const { budget, minBedrooms } = preferences;
    const predictedPrice = mockPredictPrice(property);

    // 1. Price Match Score (30%)
    let priceMatchScore;
    if (predictedPrice <= budget) {
        priceMatchScore = 100;
    } else {
        priceMatchScore = Math.max(0, 100 - ((predictedPrice - budget) / budget) * 100);
    }

    // 2. Bedroom Score (20%)
    let bedroomScore;
    if (property.bedrooms >= minBedrooms) {
        bedroomScore = 100;
    } else {
        bedroomScore = (property.bedrooms / minBedrooms) * 100;
    }

    // 3. School Rating Score (15%)
    const schoolRatingScore = (property.school_rating / 10) * 100;

    // 4. Commute Score (15%)
    let commuteScore;
    if (property.commute_time <= 15) commuteScore = 100;
    else if (property.commute_time <= 30) commuteScore = 80;
    else if (property.commute_time <= 45) commuteScore = 50;
    else commuteScore = 20;

    // 5. Property Age Score (10%)
    const age = CURRENT_YEAR - property.year_built;
    let propertyAgeScore;
    if (age <= 5) propertyAgeScore = 100;
    else if (age <= 15) propertyAgeScore = 80;
    else if (age <= 30) propertyAgeScore = 60;
    else propertyAgeScore = 40;

    // 6. Amenities Score (10%)
    const features = [property.has_pool, property.has_garage, property.has_garden];
    const amenitiesScore = (features.filter(Boolean).length / 3) * 100;

    // Calculate total weighted score
    const totalScore = (
        0.30 * priceMatchScore +
        0.20 * bedroomScore +
        0.15 * schoolRatingScore +
        0.15 * commuteScore +
        0.10 * propertyAgeScore +
        0.10 * amenitiesScore
    );

    return {
        totalScore: Math.round(totalScore * 10) / 10,
        predictedPrice,
        breakdown: {
            priceMatch: Math.round(priceMatchScore),
            bedroom: Math.round(bedroomScore),
            schoolRating: Math.round(schoolRatingScore),
            commute: Math.round(commuteScore),
            propertyAge: Math.round(propertyAgeScore),
            amenities: Math.round(amenitiesScore)
        }
    };
}

/**
 * Generate reasoning text for a property recommendation
 */
function generateReasoning(property, scoreData, preferences) {
    const reasons = [];
    const breakdown = scoreData.breakdown;

    // Price reasoning
    if (breakdown.priceMatch === 100) {
        reasons.push(`✅ Within your $${preferences.budget.toLocaleString()} budget`);
    } else if (breakdown.priceMatch > 70) {
        reasons.push(`⚡ Slightly above budget but excellent value`);
    }

    // Bedroom reasoning
    if (breakdown.bedroom === 100) {
        reasons.push(`✅ ${property.bedrooms} bedrooms meet your requirement of ${preferences.minBedrooms}+`);
    }

    // School rating
    if (breakdown.schoolRating >= 85) {
        reasons.push(`🏫 Excellent school rating: ${property.school_rating}/10`);
    } else if (breakdown.schoolRating >= 70) {
        reasons.push(`🏫 Good school rating: ${property.school_rating}/10`);
    }

    // Commute
    if (breakdown.commute >= 80) {
        reasons.push(`🚗 Short commute: ${property.commute_time} minutes`);
    }

    // Property age
    const age = CURRENT_YEAR - property.year_built;
    if (age <= 5) {
        reasons.push(`🏠 Recently built (${property.year_built})`);
    }

    // Amenities
    const amenities = [];
    if (property.has_pool) amenities.push('pool');
    if (property.has_garage) amenities.push('garage');
    if (property.has_garden) amenities.push('garden');
    if (amenities.length > 0) {
        reasons.push(`✨ Has ${amenities.join(', ')}`);
    }

    return reasons.slice(0, 4).join(' • ');
}

/**
 * Get top 3 recommended properties based on user preferences
 */
function getRecommendations(properties, preferences) {
    const scoredProperties = properties.map((property) => {
        const scoreData = calculateScore(property, preferences);
        const reasoning = generateReasoning(property, scoreData, preferences);

        return {
            ...property,
            matchScore: scoreData.totalScore,
            predictedPrice: scoreData.predictedPrice,
            scoreBreakdown: scoreData.breakdown,
            reasoning
        };
    });

    // Sort by total score (descending) and return top 3
    scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

    return scoredProperties.slice(0, 3);
}

module.exports = {
    calculateScore,
    generateReasoning,
    getRecommendations
};
