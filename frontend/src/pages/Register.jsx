import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEvent, getToken, submitProfile } from '../utils/api'
import { isRegisteredForEvent, saveEventId, saveToken, saveUserId, saveEventId as setCurrentEvent } from '../utils/auth'
import ProfileForm from '../components/ProfileForm'

export default function Register() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)

  const alreadyRegistered = isRegisteredForEvent(eventId)

  useEffect(() => {
    if (!eventId) { navigate('/events'); return }
    getEvent(eventId)
      .then((res) => setEvent(res.data))
      .catch(() => setError('Event not found.'))
  }, [eventId])

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

        {error && <div className="error-msg">{error}</div>}

        {event && (
          <div style={{
            background: 'var(--accent-dim)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 20px',
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Registering for
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>
              {event.name}
            </span>
            {event.location && (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {event.location}
              </span>
            )}
          </div>
        )}

        {event && alreadyRegistered && (
          <div className="card fade-up" style={{ textAlign: 'center', padding: '40px 32px' }}>
            <div style={{
              display: 'inline-block',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Already registered
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '1rem' }}>
              You are already registered for {event.name}.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '12px 28px' }}
                onClick={() => { saveEventId(eventId); navigate('/match') }}
              >
                Find my match
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: 'auto', padding: '12px 28px' }}
                onClick={() => navigate('/my-events')}
              >
                My events
              </button>
            </div>
          </div>
        )}

        {event && !alreadyRegistered && (
          <ProfileForm
            eventId={eventId}
            onSuccess={(userId, goToMatch) => {
              if (goToMatch) navigate('/match')
              else navigate('/my-events')
            }}
          />
        )}
      </div>
    </div>
  )
}