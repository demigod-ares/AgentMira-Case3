const express = require('express');
const router = express.Router();
const { getMergedProperties, filterProperties } = require('../services/propertyService');
const { getRecommendations } = require('../services/recommendationService');
const SavedProperty = require('../models/SavedProperty');

// GET /api/properties - Get all merged properties
router.get('/', (req, res) => {
    try {
        const properties = getMergedProperties();
        res.json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch properties'
        });
    }
});

// POST /api/properties/recommend - Get top 3 recommendations
router.post('/recommend', async (req, res) => { // AI model
    try {
        const { budget, location, minBedrooms } = req.body;

        // Validate required fields
        if (!budget || budget <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Budget is required and must be greater than 0'
            });
        }

        const preferences = {
            budget: Number(budget),
            location: location || '',
            minBedrooms: Number(minBedrooms) || 1
        };

        // Get all properties
        const properties = getMergedProperties();

        // Filter properties based on loose criteria
        const filteredProperties = filterProperties(properties, preferences);

        // Get top 3 recommendations with scoring (AI model or Mathamatical model)
        const recommendations = getRecommendations(
            filteredProperties.length > 0 ? filteredProperties : properties,
            preferences
        );

        res.json({
            success: true,
            preferences,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recommendations'
        });
    }
});

// POST /api/properties/save - Save a property to favorites
router.post('/save', async (req, res) => {
    try {
        const propertyData = req.body;

        if (!propertyData.propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Property ID is required'
            });
        }

        // Check if already saved
        const existing = await SavedProperty.findOne({ propertyId: propertyData.propertyId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Property already saved'
            });
        }

        const savedProperty = new SavedProperty(propertyData);
        await savedProperty.save();

        res.status(201).json({
            success: true,
            message: 'Property saved successfully',
            data: savedProperty
        });
    } catch (error) {
        console.error('Error saving property:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Property already saved'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to save property. MongoDB may not be connected.'
        });
    }
});

// GET /api/properties/saved - Get all saved properties
router.get('/saved', async (req, res) => {
    try {
        const savedProperties = await SavedProperty.find().sort({ savedAt: -1 });
        res.json({
            success: true,
            count: savedProperties.length,
            data: savedProperties
        });
    } catch (error) {
        console.error('Error fetching saved properties:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch saved properties. MongoDB may not be connected.'
        });
    }
});

// DELETE /api/properties/saved/:id - Remove from saved
router.delete('/saved/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SavedProperty.findOneAndDelete({ propertyId: Number(id) });

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Saved property not found'
            });
        }

        res.json({
            success: true,
            message: 'Property removed from saved'
        });
    } catch (error) {
        console.error('Error removing saved property:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove saved property'
        });
    }
});

module.exports = router;
