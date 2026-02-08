const path = require('path');
const fs = require('fs');

// Load JSON data files
const resourcesPath = path.join(__dirname, '../resources');

function loadJsonFile(filename) {
    try {
        const filePath = path.join(resourcesPath, filename);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error.message);
        return [];
    }
}

// Get all properties merged from 3 JSON sources
function getMergedProperties() {
    const basics = loadJsonFile('property_basics.json');
    const characteristics = loadJsonFile('property_characteristics.json');
    const images = loadJsonFile('property_images.json');

    // Create lookup maps for efficient merging
    const characteristicsMap = new Map(characteristics.map(c => [c.id, c]));
    const imagesMap = new Map(images.map(i => [i.id, i]));

    // Merge all data by id
    const mergedProperties = basics.map(property => {
        const chars = characteristicsMap.get(property.id) || {};
        const img = imagesMap.get(property.id) || {};

        return {
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            bedrooms: chars.bedrooms || 0,
            bathrooms: chars.bathrooms || 0,
            size_sqft: chars.size_sqft || 0,
            amenities: chars.amenities || [],
            image_url: img.image_url || null,
            // Additional scoring fields (simulated for demo)
            school_rating: generateSchoolRating(property.id),
            commute_time: generateCommuteTime(property.id),
            year_built: generateYearBuilt(property.id),
            has_pool: hasAmenity(chars.amenities, ['pool', 'swimming']),
            has_garage: hasAmenity(chars.amenities, ['garage', 'parking']),
            has_garden: hasAmenity(chars.amenities, ['garden', 'backyard', 'yard'])
        };
    });

    return mergedProperties;
}

// Helper: Generate simulated school rating (1-10) based on property id
function generateSchoolRating(id) {
    const ratings = [8.5, 7.2, 9.1, 6.8, 8.9, 7.5, 8.0, 7.8, 9.3, 8.2];
    return ratings[(id - 1) % ratings.length];
}

// Helper: Generate simulated commute time (minutes) based on property id
function generateCommuteTime(id) {
    const times = [25, 35, 45, 20, 50, 15, 40, 30, 55, 28];
    return times[(id - 1) % times.length];
}

// Helper: Generate simulated year built based on property id
function generateYearBuilt(id) {
    const years = [2018, 2005, 2020, 2015, 2022, 2010, 1998, 2019, 2021, 2023];
    return years[(id - 1) % years.length];
}

// Helper: Check if amenities contain certain keywords
function hasAmenity(amenities, keywords) {
    if (!amenities || !Array.isArray(amenities)) return false;
    return amenities.some(amenity =>
        keywords.some(keyword =>
            amenity.toLowerCase().includes(keyword.toLowerCase())
        )
    );
}

// Filter properties based on user preferences
function filterProperties(properties, preferences) {
    const { budget, location, minBedrooms } = preferences;

    return properties.filter(property => {
        // Budget filter: include if within budget or slightly over (10% tolerance for recommendations)
        if (budget && property.price > budget * 1.5) return false;

        // Location filter: partial match (case-insensitive)
        if (location && location.trim() !== '') {
            const searchLocation = location.toLowerCase().trim();
            const propertyLocation = property.location.toLowerCase();
            if (!propertyLocation.includes(searchLocation) &&
                !searchLocation.split(',').some(part => propertyLocation.includes(part.trim()))) {
                // Allow all locations if no match (for better UX)
                // return false; // Uncomment for strict filtering
            }
        }

        // Bedroom filter
        if (minBedrooms && property.bedrooms < minBedrooms * 0.5) return false;

        return true;
    });
}

module.exports = {
    getMergedProperties,
    filterProperties
};
