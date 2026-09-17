import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getEvent } from '../utils/api'
import axios from 'axios'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function ManageEvent() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || localStorage.getItem(`organizer_token_${eventId}`)

  const [event, setEvent] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [done, setDone] = useState(null)

  useEffect(() => {
    if (!token) { navigate('/events'); return }
    Promise.all([
      getEvent(eventId),
      axios.get(`/api/events/${eventId}/stats`),
    ])
      .then(([eventRes, statsRes]) => {
        setEvent(eventRes.data)
        setStats(statsRes.data)
      })
      .catch(() => setError('Could not load event.'))
      .finally(() => setLoading(false))
  }, [eventId, token])

  const handleEnd = async () => {
    const confirmed = window.confirm('End this event? Attendees will no longer be able to find matches.')
    if (!confirmed) return
    setActionLoading('end')
    try {
      await axios.post(`/api/events/${eventId}/end?organizer_token=${token}`)
      setDone('ended')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not end event.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    const confirmed = window.confirm('Cancel and delete this event? This cannot be undone.')
    if (!confirmed) return
    setActionLoading('cancel')
    try {
      await axios.delete(`/api/events/${eventId}?organizer_token=${token}`)
      setDone('cancelled')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not cancel event.')
    } finally {
      setActionLoading(null)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
        <div className="container">
          <div className="card fade-up" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
              {done === 'ended' ? 'Event ended' : 'Event cancelled'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              {done === 'ended'
                ? 'The event has been ended. Attendees can no longer find new matches.'
                : 'The event has been cancelled and removed.'}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 28px' }}
              onClick={() => navigate('/events')}
            >
              Back to events
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div className="container">
        <button
          className="btn btn-ghost"
          style={{ marginBottom: 32, padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => navigate('/events')}
        >
          Back to events
        </button>

        {loading && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 48 }}>
            <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {event && (
          <div className="fade-up">
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: 'inline-block',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 6, padding: '4px 12px',
                fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                Organizer dashboard
              </div>
              <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{event.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{formatDate(event.date)} · {event.location}</p>
            </div>

            {stats && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Event stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                      {stats.registered}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: stats.matching_open ? '#4ade80' : '#fbbf24' }}>
                      {stats.matching_open ? 'Open' : 'Waiting'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Matching</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                      {event.min_pool_size}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Min to match</p>
                  </div>
                </div>
              </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Registration link</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Share this with attendees so they can register.
              </p>
              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--accent)', wordBreak: 'break-all' }}>
                  {window.location.origin}/register/{event.id}
                </p>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', flexShrink: 0 }}
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/register/${event.id}`)}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="card" style={{
              border: '1px solid rgba(248,113,113,0.2)',
              background: 'rgba(248,113,113,0.04)',
            }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 8, color: 'var(--text)' }}>Event actions</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Ending the event stops new matches but keeps all data. Cancelling removes the event entirely.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-ghost"
                  style={{
                    width: 'auto', padding: '12px 24px',
                    color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)',
                  }}
                  disabled={actionLoading !== null}
                  onClick={handleEnd}
                >
                  {actionLoading === 'end' ? 'Ending...' : 'End event'}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{
                    width: 'auto', padding: '12px 24px',
                    color: 'var(--error)', borderColor: 'rgba(248,113,113,0.3)',
                  }}
                  disabled={actionLoading !== null}
                  onClick={handleCancel}
                >
                  {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel event'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}