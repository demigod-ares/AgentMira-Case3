function PropertyComparison({ properties, onClose }) {
    if (!properties || properties.length < 2) return null

    const comparisonFields = [
        { key: 'price', label: 'Price', format: (v) => `$${v?.toLocaleString()}` },
        { key: 'predictedPrice', label: 'AI Predicted Price', format: (v) => v ? `$${v?.toLocaleString()}` : 'N/A' },
        { key: 'matchScore', label: 'Match Score', format: (v) => `${v}%` },
        { key: 'bedrooms', label: 'Bedrooms', format: (v) => v },
        { key: 'bathrooms', label: 'Bathrooms', format: (v) => v },
        { key: 'size_sqft', label: 'Size (sqft)', format: (v) => v?.toLocaleString() },
        { key: 'location', label: 'Location', format: (v) => v },
        { key: 'school_rating', label: 'School Rating', format: (v) => v ? `${v}/10` : 'N/A' },
        { key: 'commute_time', label: 'Commute Time', format: (v) => v ? `${v} min` : 'N/A' },
        { key: 'year_built', label: 'Year Built', format: (v) => v || 'N/A' },
    ]

    const getBestValue = (field, values) => {
        if (field === 'price' || field === 'predictedPrice' || field === 'commute_time') {
            return Math.min(...values.filter(v => v != null))
        }
        return Math.max(...values.filter(v => v != null))
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
            }}
            onClick={onClose}
        >
            <div
                className="comparison-view"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '1200px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            >
                <div className="comparison-header">
                    <h2>📊 Property Comparison</h2>
                    <button className="btn btn-secondary" onClick={onClose}>
                        ✕ Close
                    </button>
                </div>

                <div className="comparison-grid">
                    {properties.map((property, index) => (
                        <div key={property.id} className="comparison-card">
                            <div style={{ marginBottom: '1rem' }}>
                                <img
                                    src={property.image_url}
                                    alt={property.title}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '0.5rem',
                                        marginBottom: '0.5rem'
                                    }}
                                />
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{property.title}</h4>
                            </div>

                            {comparisonFields.map(({ key, label, format }) => {
                                const value = property[key]
                                const allValues = properties.map(p => p[key])
                                const bestValue = getBestValue(key, allValues)
                                const isBest = value === bestValue

                                return (
                                    <div className="comparison-row" key={key}>
                                        <label>{label}</label>
                                        <span style={{
                                            color: isBest ? 'var(--success)' : 'var(--text-primary)',
                                            fontWeight: isBest ? 700 : 500
                                        }}>
                                            {format(value)}
                                            {isBest && ' ✓'}
                                        </span>
                                    </div>
                                )
                            })}

                            <div className="comparison-row">
                                <label>Amenities</label>
                                <span style={{ fontSize: '0.85rem' }}>
                                    {property.amenities?.join(', ') || 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PropertyComparison
