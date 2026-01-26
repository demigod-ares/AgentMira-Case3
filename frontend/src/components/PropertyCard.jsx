function PropertyCard({ property, onSave, onRemove, onCompare, isSaved, isComparing }) {
    const matchScore = property.matchScore || 0
    const scoreClass = matchScore >= 80 ? 'high' : matchScore >= 60 ? 'medium' : ''

    const handleSaveClick = () => {
        if (isSaved && onRemove) {
            onRemove(property.id)
        } else if (onSave) {
            onSave(property)
        }
    }

    return (
        <div className={`property-card ${isComparing ? 'comparing' : ''}`}>
            <div className="property-image">
                <img
                    src={property.image_url || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                    alt={property.title}
                    onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'
                    }}
                />

                {matchScore > 0 && (
                    <div className={`match-badge ${scoreClass}`}>
                        ⭐ {matchScore}%
                    </div>
                )}

                <button
                    className={`save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={handleSaveClick}
                    title={isSaved ? 'Remove from saved' : 'Save property'}
                >
                    {isSaved ? '❌' : '❤️'}
                </button>
            </div>

            <div className="property-content">
                <div className="property-price">
                    ${property.price?.toLocaleString()}
                </div>

                {property.predictedPrice && (
                    <div className="predicted-price">
                        AI Predicted: ${property.predictedPrice?.toLocaleString()}
                    </div>
                )}

                <h3 className="property-title">{property.title}</h3>

                <div className="property-location">
                    📍 {property.location}
                </div>

                <div className="property-features">
                    <div className="feature">
                        🛏️ <span>{property.bedrooms}</span> Beds
                    </div>
                    <div className="feature">
                        🚿 <span>{property.bathrooms}</span> Baths
                    </div>
                    <div className="feature">
                        📐 <span>{property.size_sqft?.toLocaleString()}</span> sqft
                    </div>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                    <div className="property-amenities">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="amenity-tag">
                                {amenity}
                            </span>
                        ))}
                        {property.amenities.length > 3 && (
                            <span className="amenity-tag">+{property.amenities.length - 3}</span>
                        )}
                    </div>
                )}

                {property.reasoning && (
                    <div className="property-reasoning">
                        {property.reasoning}
                    </div>
                )}

                {property.scoreBreakdown && (
                    <div className="score-breakdown">
                        <div className="score-item">
                            <label>Price</label>
                            <span>{property.scoreBreakdown.priceMatch}%</span>
                        </div>
                        <div className="score-item">
                            <label>Beds</label>
                            <span>{property.scoreBreakdown.bedroom}%</span>
                        </div>
                        <div className="score-item">
                            <label>Schools</label>
                            <span>{property.scoreBreakdown.schoolRating}%</span>
                        </div>
                        <div className="score-item">
                            <label>Commute</label>
                            <span>{property.scoreBreakdown.commute}%</span>
                        </div>
                        <div className="score-item">
                            <label>Age</label>
                            <span>{property.scoreBreakdown.propertyAge}%</span>
                        </div>
                        <div className="score-item">
                            <label>Amenities</label>
                            <span>{property.scoreBreakdown.amenities}%</span>
                        </div>
                    </div>
                )}

                {onCompare && (
                    <button
                        className={`btn ${isComparing ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => onCompare(property)}
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {isComparing ? '✓ Selected for Comparison' : '📊 Add to Compare'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default PropertyCard
