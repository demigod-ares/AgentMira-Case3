import { useState, useRef, useEffect } from 'react'

const INITIAL_MESSAGES = [
    {
        type: 'bot',
        text: "👋 Hi! I'm PropertyAI, your smart home finder assistant. I'll help you discover the perfect property based on your preferences."
    },
    {
        type: 'bot',
        text: "Tell me about your dream home! Enter your budget, preferred location, and minimum bedrooms below, and I'll find the top 3 matching properties for you. 🏠"
    }
]

function ChatBot({ onSearch, loading, hasResults }) {
    const [messages, setMessages] = useState(INITIAL_MESSAGES)
    const [budget, setBudget] = useState('')
    const [location, setLocation] = useState('')
    const [minBedrooms, setMinBedrooms] = useState(2)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!budget || budget <= 0) {
            addMessage('bot', "⚠️ Please enter a valid budget to continue.")
            return
        }

        const prefs = {
            budget: Number(budget),
            location: location || '',
            minBedrooms: Number(minBedrooms) || 2
        }

        // Add user message
        addMessage('user', `Looking for properties with budget $${Number(budget).toLocaleString()}, ${minBedrooms}+ bedrooms${location ? ` in ${location}` : ''}.`)

        // Add bot searching message
        setTimeout(() => {
            addMessage('bot', "🔍 Analyzing properties and calculating match scores based on your preferences...")
        }, 300)

        // Trigger search
        onSearch(prefs)
    }

    const addMessage = (type, text) => {
        setMessages(prev => [...prev, { type, text }])
    }

    useEffect(() => {
        if (hasResults && !loading) {
            addMessage('bot', "✨ Found your top 3 recommended properties! Each one is scored based on price match, bedrooms, school ratings, commute time, property age, and amenities. Check them out on the right! →")
        }
    }, [hasResults, loading])

    return (
        <div className="chatbot-panel">
            <div className="chatbot-header">
                <div className="chatbot-avatar">🤖</div>
                <div className="chatbot-info">
                    <h3>PropertyAI Assistant</h3>
                    <span>Online</span>
                </div>
            </div>

            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                {loading && (
                    <div className="message bot">
                        <p>⏳ Searching for the best matches...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="preference-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>💰 Budget (USD)</label>
                        <input
                            type="number"
                            placeholder="e.g., 500000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            min="0"
                            step="10000"
                        />
                    </div>

                    <div className="form-group">
                        <label>📍 Preferred Location</label>
                        <input
                            type="text"
                            placeholder="e.g., New York, NY"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>🛏️ Min. Bedrooms</label>
                        <select
                            value={minBedrooms}
                            onChange={(e) => setMinBedrooms(e.target.value)}
                        >
                            <option value="1">1+ Bedroom</option>
                            <option value="2">2+ Bedrooms</option>
                            <option value="3">3+ Bedrooms</option>
                            <option value="4">4+ Bedrooms</option>
                            <option value="5">5+ Bedrooms</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? '🔄 Searching...' : '🔍 Find Home'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ChatBot
