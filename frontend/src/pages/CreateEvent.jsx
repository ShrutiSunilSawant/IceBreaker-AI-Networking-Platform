import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../utils/api'
import Navbar from '../components/Navbar'

export default function CreateEvent() {
  const navigate = useNavigate()
  const stored = localStorage.getItem('platform_user')
  const platformUser = stored ? JSON.parse(stored) : null
  const platformEmail = platformUser?.email || ''
  const platformName = platformUser?.display_name || ''

  const [form, setForm] = useState({
    name: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    organizer_name: platformName,
    organizer_email: platformEmail,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)
  const dateRef = useRef(null)
  const startTimeRef = useRef(null)
  const endTimeRef = useRef(null)

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError(null)
    const eventDate = dateRef.current?.value || form.eventDate
    const startTime = startTimeRef.current?.value || form.startTime
    const endTime = endTimeRef.current?.value || form.endTime
    const missing = []
    if (!form.name) missing.push('Event name')
    if (!eventDate) missing.push('Date')
    if (!startTime) missing.push('Start time')
    if (!endTime) missing.push('End time')
    if (!form.location) missing.push('Address')
    if (!form.description) missing.push('Description')
    if (!form.organizer_name) missing.push('Your name')
    if (!form.organizer_email) missing.push('Your email')
    if (missing.length) { setError(`Please fill in: ${missing.join(', ')}`); return }
    if (endTime <= startTime) { setError('End time must be after start time.'); return }
    setLoading(true)
    try {
      const res = await createEvent({
        name: form.name,
        date: `${eventDate}T${startTime}`,
        end_time: `${eventDate}T${endTime}`,
        location: form.location,
        description: form.description,
        organizer_email: form.organizer_email,
      })
      setCreated(res.data)
      // Save organizer token to localStorage
      localStorage.setItem(`organizer_token_${res.data.id}`, res.data.organizer_token)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not create event. Please try again.')
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

            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{created.name}</h2>
            {form.organizer_name && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>
                Organized by <strong style={{ color: 'var(--text)' }}>{form.organizer_name}</strong>
              </p>
            )}
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
                Your organizer token. Save this
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
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      <Navbar />
      <div style={{ padding: '48px 24px' }}>
      <div className="container">

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="field">
            <label>Your name *</label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={form.organizer_name}
              onChange={update('organizer_name')}
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
          </div>
        </div>

        <div className="field">
          <label>Date *</label>
          <input
            ref={dateRef}
            type="date"
            value={form.eventDate}
            onChange={update('eventDate')}
            onClick={(e) => e.target.showPicker?.()}
            min={new Date().toISOString().split('T')[0]}
            autoComplete="off"
            style={{ colorScheme: 'dark', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="field">
            <label>Start time *</label>
            <input
              ref={startTimeRef}
              type="time"
              value={form.startTime}
              onChange={update('startTime')}
              onClick={(e) => e.target.showPicker?.()}
              autoComplete="off"
              style={{ colorScheme: 'dark', cursor: 'pointer' }}
            />
          </div>
          <div className="field">
            <label>End time *</label>
            <input
              ref={endTimeRef}
              type="time"
              value={form.endTime}
              onChange={update('endTime')}
              onClick={(e) => e.target.showPicker?.()}
              autoComplete="off"
              style={{ colorScheme: 'dark', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="field">
          <label>Address *</label>
          <input
            type="text"
            placeholder="123 Main St, San Francisco, CA 94105"
            value={form.location}
            onChange={update('location')}
          />
          <span className="hint">Full address so attendees can find the venue.</span>
        </div>

        <div className="field">
          <label>Description *</label>
          <textarea
            rows={3}
            placeholder="What is this event about? Who should attend?"
            value={form.description}
            onChange={update('description')}
            required
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ fontSize: '1.05rem', padding: '16px', marginTop: 8 }}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span style={{ marginLeft: 4, fontSize: '0.95rem' }}>Setting up your event…</span>
            </span>
          ) : 'Create event'}
        </button>
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 10 }}>
            This takes a few seconds — we're reviewing your event details.
          </p>
        )}
      </div>
      </div>
    </div>
  )
}