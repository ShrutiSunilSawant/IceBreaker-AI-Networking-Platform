import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../utils/api'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    duration_hours: 3,
    min_pool_size: 2,
    organizer_email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.name || !form.date || !form.organizer_email) {
      setError('Event name, date, and your email are required.')
      return
    }
    setLoading(true)
    try {
      const res = await createEvent({
        ...form,
        min_pool_size: parseInt(form.min_pool_size),
        duration_hours: parseFloat(form.duration_hours),
      })
      setCreated(res.data)
      // Save organizer token to localStorage
      localStorage.setItem(`organizer_token_${res.data.id}`, res.data.organizer_token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create event.')
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
        <div className="container">
          <div className="card fade-up" style={{ textAlign: 'center', padding: '40px 32px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(74,222,128,0.1)',
              color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Event created
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{created.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
              Your event is live. Share the link below with attendees.
            </p>

            <div style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              marginBottom: 24,
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Registration link
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent)', wordBreak: 'break-all' }}>
                {window.location.origin}/register/{created.id}
              </p>
              <button
                className="btn btn-ghost"
                style={{ marginTop: 10, padding: '6px 14px', fontSize: '0.8rem', width: 'auto' }}
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/register/${created.id}`)}
              >
                Copy link
              </button>
            </div>

            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              marginBottom: 28,
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Your organizer token — save this
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                You need this to end or cancel the event. It has been saved in your browser but save it somewhere safe too.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {created.organizer_token}
              </p>
              <button
                className="btn btn-ghost"
                style={{ marginTop: 10, padding: '6px 14px', fontSize: '0.8rem', width: 'auto' }}
                onClick={() => navigator.clipboard.writeText(created.organizer_token)}
              >
                Copy token
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '12px 28px' }}
                onClick={() => navigate(`/manage-event/${created.id}?token=${created.organizer_token}`)}
              >
                Manage event
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: 'auto', padding: '12px 28px' }}
                onClick={() => navigate('/events')}
              >
                Browse events
              </button>
            </div>
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

        <div className="fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Create an event</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Set up a networking event. Attendees will register and get matched.
          </p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>Event name *</label>
          <input
            type="text"
            placeholder="SF AI Networking Night"
            value={form.name}
            onChange={update('name')}
          />
        </div>

        <div className="field">
          <label>Your email *</label>
          <input
            type="email"
            placeholder="organizer@company.com"
            value={form.organizer_email}
            onChange={update('organizer_email')}
          />
          <span className="hint">Used to identify you as the organizer. Not shown publicly.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="field">
            <label>Date and time *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={update('date')}
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              placeholder="San Francisco, CA"
              value={form.location}
              onChange={update('location')}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="field">
            <label>Duration</label>
            <select
              value={form.duration_hours}
              onChange={update('duration_hours')}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '1rem',
                padding: '14px 16px',
                outline: 'none',
                colorScheme: 'dark',
              }}
            >
              <option value={1}>1 hour</option>
              <option value={1.5}>1.5 hours</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
              <option value={5}>5 hours</option>
              <option value={6}>6 hours</option>
              <option value={8}>8 hours</option>
            </select>
          </div>
          <div className="field">
            <label>Minimum attendees before matching opens</label>
            <input
              type="number"
              min={2}
              max={100}
              value={form.min_pool_size}
              onChange={update('min_pool_size')}
            />
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            rows={3}
            placeholder="What is this event about? Who should attend?"
            value={form.description}
            onChange={update('description')}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ fontSize: '1.05rem', padding: '16px', marginTop: 8 }}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </span>
          ) : 'Create event'}
        </button>
      </div>
    </div>
  )
}