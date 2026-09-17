import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listEvents, getToken } from '../utils/api'
import { saveToken, saveUserId, saveEventId, isRegisteredForEvent } from '../utils/auth'
import { submitProfile } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await listEvents()
      setEvents(res.data)
      setStep('pick-event')
    } catch {
      setError('Could not load events. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleEventSelect = async (eventId) => {
    setSelectedEventId(eventId)
    setError(null)
    setLoading(true)
    try {
      const tokenRes = await getToken(email, eventId)
      const token = tokenRes.data.access_token
      saveToken(token, eventId)
      saveEventId(eventId)

      // Derive user_id the same way the backend does
      const encoder = new TextEncoder()
      const data = encoder.encode(email + eventId)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      saveUserId(userId, eventId)

      navigate('/match')
    } catch (err) {
      setError('Could not log in. Make sure you registered for this event.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div className="container">
        <button
          className="btn btn-ghost"
          style={{ marginBottom: 32, padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => navigate('/')}
        >
          Back
        </button>

        <div className="fade-up" style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Enter your email to access your matches.
          </p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {step === 'email' && (
          <div className="fade-up">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleEmailSubmit}
              disabled={loading}
              style={{ fontSize: '1.05rem', padding: '16px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </span>
              ) : 'Continue'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              New here?{' '}
              <span
                style={{ color: 'var(--accent)', cursor: 'pointer' }}
                onClick={() => navigate('/events')}
              >
                Browse events to register
              </span>
            </p>
          </div>
        )}

        {step === 'pick-event' && (
          <div className="fade-up">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Select the event you registered for:
            </p>

            {events.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No active events found.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.map((event) => {
                const isSelected = selectedEventId === event.id
                return (
                  <div
                    key={event.id}
                    className="card"
                    style={{
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading && !isSelected ? 0.5 : 1,
                      borderColor: isSelected ? 'rgba(108,99,255,0.5)' : undefined,
                      boxShadow: isSelected ? '0 0 24px rgba(108,99,255,0.08)' : undefined,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      padding: '20px 24px',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(108,99,255,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                    onClick={() => !loading && handleEventSelect(event.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{event.name}</h3>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {formatDate(event.date)}
                          </span>
                          {event.location && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && loading && (
                        <span style={{ display: 'flex', gap: 5 }}>
                          <span className="loading-dot" />
                          <span className="loading-dot" />
                          <span className="loading-dot" />
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <span
                style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => { setStep('email'); setError(null) }}
              >
                Use a different email
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}