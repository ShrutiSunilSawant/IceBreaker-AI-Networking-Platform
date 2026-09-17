import { useState } from 'react'
import axios from 'axios'

export default function EventPrep({ eventId, description }) {
  const [prep, setPrep] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrep = async () => {
    if (open && prep) { setOpen(false); return }
    if (open && !prep) { setOpen(false); return }
    setOpen(true)
    if (prep) return

    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`/api/events/${eventId}/prep`, { timeout: 15000 })
      setPrep(res.data.prep)
    } catch {
      setError('Could not load prep notes. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 16 }}>

      {/* Always show description if available */}
      {description && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 12,
          padding: '12px 16px',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
        }}>
          {description}
        </p>
      )}

      <button
        className="btn btn-ghost"
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: '10px 16px',
          fontSize: '0.875rem',
        }}
        onClick={fetchPrep}
      >
        <span>AI prep guide for this event</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
          {open ? 'Hide' : 'Generate'}
        </span>
      </button>

      {open && (
        <div className="fade-up" style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          marginTop: 8,
        }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 4 }}>
                  Generating prep guide...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => { setPrep(null); fetchPrep() }}
              >
                Retry
              </button>
            </div>
          )}

          {prep && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                }}>
                  Key Topics
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {prep.topics?.map((t, i) => (
                    <span key={i} style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                }}>
                  What to Expect
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {prep.what_to_expect}
                </p>
              </div>

              <div>
                <h4 style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                }}>
                  Questions to Ask Others
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {prep.questions_to_ask?.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                }}>
                  Tips
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {prep.tips?.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}