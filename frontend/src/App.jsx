import { useState, useEffect } from 'react'
import './index.css'
import ChatBot from './components/ChatBot'
import PropertyCard from './components/PropertyCard'
import PropertyComparison from './components/PropertyComparison'

// Use relative path for API calls - works with Cloudflare Tunnel routing
// In development (localhost:5137), this proxies to localhost:5000 via Vite config
// In production (Cloudflare Tunnel), this routes through /api/* ingress rule
const API_BASE = '/api'

function App() {
  const [recommendations, setRecommendations] = useState([])
  const [savedProperties, setSavedProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('recommendations')
  const [compareList, setCompareList] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [preferences, setPreferences] = useState(null)

  // Fetch saved properties on mount
  useEffect(() => {
    fetchSavedProperties()
  }, [])

  const fetchSavedProperties = async () => {
    try {
      const res = await fetch(`${API_BASE}/properties/saved`)
      const data = await res.json()
      if (data.success) {
        setSavedProperties(data.data)
      }
    } catch (error) {
      console.log('MongoDB not connected - saved properties unavailable')
    }
  }

  const handleSearch = async (prefs) => {
    setLoading(true)
    setPreferences(prefs)
    try {
      const res = await fetch(`${API_BASE}/properties/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      })
      const data = await res.json()
      if (data.success) {
        setRecommendations(data.data)
        setActiveTab('recommendations')
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProperty = async (property) => {
    try {
      const res = await fetch(`${API_BASE}/properties/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          title: property.title,
          price: property.price,
          location: property.location,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          size_sqft: property.size_sqft,
          amenities: property.amenities,
          image_url: property.image_url,
          matchScore: property.matchScore,
          reasoning: property.reasoning
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchSavedProperties()
      }
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const handleRemoveSaved = async (propertyId) => {
    try {
      const res = await fetch(`${API_BASE}/properties/saved/${propertyId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchSavedProperties()
      }
    } catch (error) {
      console.error('Error removing saved property:', error)
    }
  }

  const handleCompare = (property) => {
    if (compareList.find(p => p.id === property.id)) {
      setCompareList(compareList.filter(p => p.id !== property.id))
    } else if (compareList.length < 3) {
      setCompareList([...compareList, property])
    }
  }

  const isPropertySaved = (propertyId) => {
    return savedProperties.some(p => p.propertyId === propertyId)
  }

  const currentProperties = activeTab === 'recommendations' ? recommendations : savedProperties

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 PropertyAI - Smart Home Finder</h1>
      </header>

      <main className="main-content">
        <ChatBot
          onSearch={handleSearch}
          loading={loading}
          hasResults={recommendations.length > 0}
        />

        <section className="results-panel">
          <div className="results-header">
            <h2>
              {activeTab === 'recommendations' ? '✨ Recommendations' : '❤️ Saved Properties'}
              {preferences && activeTab === 'recommendations' && (
                <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  (Budget: ${preferences.budget?.toLocaleString()}, {preferences.minBedrooms}+ beds)
                </span>
              )}
            </h2>
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommendations')}
              >
                Recommendations ({recommendations.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Saved ({savedProperties.length})
              </button>
            </div>
          </div>

          {compareList.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {compareList.length} properties selected for comparison
              </span>
              <button
                className="btn btn-primary"
                onClick={() => setShowComparison(true)}
                disabled={compareList.length < 2}
              >
                Compare Properties
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setCompareList([])}
              >
                Clear Selection
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : currentProperties.length > 0 ? (
            <div className="properties-grid">
              {currentProperties.map((property) => (
                <PropertyCard
                  key={property.id || property.propertyId}
                  property={activeTab === 'saved' ? { ...property, id: property.propertyId } : property}
                  onSave={activeTab === 'recommendations' ? handleSaveProperty : null}
                  onRemove={activeTab === 'saved' ? handleRemoveSaved : null}
                  onCompare={handleCompare}
                  isSaved={isPropertySaved(property.id || property.propertyId)}
                  isComparing={compareList.some(p => p.id === (property.id || property.propertyId))}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">🏡</div>
              <h3>No properties yet</h3>
              <p>
                {activeTab === 'recommendations'
                  ? 'Enter your preferences in the chat to get personalized recommendations!'
                  : 'Save properties you like from your recommendations.'}
              </p>
            </div>
          )}
        </section>
      </main>

      {showComparison && (
        <PropertyComparison
          properties={compareList}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  )
}

export default App
