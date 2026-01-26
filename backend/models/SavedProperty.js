const mongoose = require('mongoose');

const savedPropertySchema = new mongoose.Schema({
    propertyId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    bedrooms: Number,
    bathrooms: Number,
    size_sqft: Number,
    amenities: [String],
    image_url: String,
    matchScore: Number,
    reasoning: String,
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure unique property entries per user session
savedPropertySchema.index({ propertyId: 1 }, { unique: true });

module.exports = mongoose.model('SavedProperty', savedPropertySchema);
