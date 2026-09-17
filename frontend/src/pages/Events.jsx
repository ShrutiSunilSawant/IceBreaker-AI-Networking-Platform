import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listEvents, getEventStats } from '../utils/api'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function AttendeeCount({ eventId, minPoolSize }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getEventStats(eventId)
      .then(res => setStats(res.data))
      .catch(() => {})
  }, [eventId])

  if (!stats) return null

  const pct = Math.min(100, Math.round((stats.registered / stats.min_pool_size) * 100))
  const color = stats.matching_open ? '#4ade80' : 'var(--accent)'

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {stats.registered} registered
        </span>
        <span style={{ fontSize: '0.78rem', color, fontWeight: 600 }}>
          {stats.matching_open ? 'Matching open' : `${stats.min_pool_size - stats.registered} more needed to match`}
        </span>
      </div>
      <div style={{ background: 'var(--surface-2)', borderRadius: 100, height: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 100,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

function EventModal({ event, onClose, onRegister }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getEventStats(event.id)
      .then(res => setStats(res.data))
      .catch(() => {})
  }, [event.id])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '36px',
          maxWidth: 560,
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            color: 'var(--text-secondary)', fontSize: '1.2rem',
            cursor: 'pointer', lineHeight: 1, padding: '4px 8px',
          }}
        >
          x
        </button>

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
          Event Details
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{event.name}</h2>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {formatDate(event.date)}
          </span>
          {event.location && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {event.location}
            </span>
          )}
        </div>

        {stats && (
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {stats.registered} {stats.registered === 1 ? 'person' : 'people'} registered
              </span>
              <span style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: stats.matching_open ? '#4ade80' : 'var(--accent)',
              }}>
                {stats.matching_open
                  ? 'Matching is open'
                  : `Matching opens at ${stats.min_pool_size} attendees`}
              </span>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.round((stats.registered / stats.min_pool_size) * 100))}%`,
                background: stats.matching_open ? '#4ade80' : 'var(--accent)',
                borderRadius: 100,
                transition: 'width 0.4s ease',
              }} />
            </div>
            {!stats.matching_open && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                Register now — you will be matched automatically once {stats.min_pool_size - stats.registered} more {stats.min_pool_size - stats.registered === 1 ? 'person registers' : 'people register'}.
              </p>
            )}
          </div>
        )}

        {event.description && (
          <p style={{
            fontSize: '0.95rem', color: 'var(--text-secondary)',
            lineHeight: 1.7, marginBottom: 28,
            whiteSpace: 'pre-line',
          }}>
            {event.description}
          </p>
        )}

        <button
          className="btn btn-primary"
          style={{ fontSize: '1rem', padding: '14px' }}
          onClick={() => onRegister(event.id)}
        >
          Register for this event
        </button>
      </div>
    </div>
  )
}

export default function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    listEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRegister = (eventId) => {
    setSelected(null)
    navigate(`/register/${eventId}`)
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
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Upcoming Events</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Click an event to learn more, then register to find your match.
          </p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
                animation: 'pulse 1.5s ease infinite',
              }}>
               <div style={{ height: 18, width: '40%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 10 }} />
               <div style={{ height: 14, width: '60%', background: 'var(--surface-2)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              No upcoming events right now.
            </p>
            <button
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => navigate('/create-event')}
            >
              Create one
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((event, i) => (
            <div
              key={event.id}
              className="card fade-up"
              style={{
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                animationDelay: `${i * 0.08}s`,
                padding: '20px 24px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(108,99,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onClick={() => setSelected(event)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: 6 }}>{event.name}</h2>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatDate(event.date)}
                    </span>
                    {event.location && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {event.location}
                      </span>
                    )}
                  </div>
                  <AttendeeCount eventId={event.id} minPoolSize={event.min_pool_size} />
                </div>
                <div style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 6, padding: '6px 14px',
                  fontSize: '0.8rem', fontWeight: 600,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  View details
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.875rem', width: 'auto', padding: '10px 24px' }}
            onClick={() => navigate('/create-event')}
          >
            Create a new event
          </button>
        </div>
      </div>

      {selected && (
        <EventModal
          event={selected}
          onClose={() => setSelected(null)}
          onRegister={handleRegister}
        />
      )}
    </div>
  )
}