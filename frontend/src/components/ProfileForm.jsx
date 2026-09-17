import { useState } from 'react'
import { submitProfile, getToken } from '../utils/api'
import { saveToken, saveUserId, saveEventId } from '../utils/auth'

export default function ProfileForm({ eventId, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    what_you_do: '',
    looking_for: '',
    interests: '',
    consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.consent) { setError('You must agree to the terms to continue.'); return false }
    if (!form.name || !form.email || !form.role || !form.what_you_do || !form.looking_for) { setError('Please fill in all required fields.'); return false }
    if (form.what_you_do.length < 20) { setError('Please describe what you work on in at least 20 characters.'); return false }
    return true
  }

  const doRegister = async () => {
    setError(null)
    if (!validate()) return null

    setLoading(true)
    try {
      const tokenRes = await getToken(form.email, eventId)
      const token = tokenRes.data.access_token
      saveToken(token, eventId)
      saveEventId(eventId)

      const profileRes = await submitProfile({ ...form, event_id: eventId })
      saveUserId(profileRes.data.user_id, eventId)
      return profileRes.data.user_id
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    const userId = await doRegister()
    if (userId) onSuccess(userId, false)
  }

  const handleFindMatch = async () => {
    const userId = await doRegister()
    if (userId) onSuccess(userId, true)
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Tell us about yourself</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          We will find you a great person to talk to and give you the exact questions to start.
        </p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div className="field">
          <label>Name *</label>
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={update('name')}
          />
        </div>
        <div className="field">
          <label>Role *</label>
          <input
            type="text"
            placeholder="ML Engineer, Founder, PM..."
            value={form.role}
            onChange={update('role')}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div className="field">
          <label>Email *</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={update('email')}
          />
        </div>
        <div className="field">
          <label>Company</label>
          <input
            type="text"
            placeholder="Where do you work? (optional)"
            value={form.company}
            onChange={update('company')}
          />
        </div>
      </div>

      <div className="field">
        <label>What you work on *</label>
        <textarea
          rows={3}
          placeholder="Describe what you build, research, or focus on. Be specific — this is the most important field for matching."
          value={form.what_you_do}
          onChange={update('what_you_do')}
        />
        <span className="hint">{form.what_you_do.length} / 500 characters. Minimum 20.</span>
      </div>

      <div className="field">
        <label>What you are looking for *</label>
        <textarea
          rows={2}
          placeholder="Collaborators, feedback, hiring, investors, or just great conversation..."
          value={form.looking_for}
          onChange={update('looking_for')}
        />
      </div>

      <div className="field">
        <label>Interests outside work</label>
        <input
          type="text"
          placeholder="Rock climbing, building keyboards, reading sci-fi... (optional)"
          value={form.interests}
          onChange={update('interests')}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '16px',
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        <input
          type="checkbox"
          id="consent"
          checked={form.consent}
          onChange={update('consent')}
          style={{ marginTop: 2, accentColor: 'var(--accent)', width: 16, height: 16, flexShrink: 0 }}
        />
        <label htmlFor="consent" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          I agree that my profile will be used for matching at this event. Profiles are stored as embeddings only and deleted within 24 hours of the event ending.
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn btn-ghost"
          onClick={handleRegister}
          disabled={loading}
          style={{ fontSize: '1rem', padding: '14px', flex: 1 }}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </span>
          ) : 'Register'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleFindMatch}
          disabled={loading}
          style={{ fontSize: '1rem', padding: '14px', flex: 1 }}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </span>
          ) : 'Find my match'}
        </button>
      </div>
    </div>
  )
}