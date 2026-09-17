import { useState } from 'react'
import { submitFeedback } from '../utils/api'
import { getStoredUserId } from '../utils/auth'

export default function FeedbackBar({ matchId }) {
  const [sent, setSent] = useState(false)
  const [selected, setSelected] = useState(null)

  const handleFeedback = async (rating) => {
    const userId = getStoredUserId()
    if (!userId) return
    setSelected(rating)
    try {
      await submitFeedback(matchId, userId, rating)
      setSent(true)
    } catch {
      // silently fail
    }
  }

  if (sent) {
    return (
      <div style={{
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        padding: '16px',
      }}>
        Thanks for the feedback.
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '20px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Was this match helpful?
      </span>
      <button
        className="btn btn-ghost"
        style={{
          padding: '8px 18px',
          fontSize: '0.9rem',
          borderColor: selected === 1 ? 'var(--success)' : undefined,
          color: selected === 1 ? 'var(--success)' : undefined,
        }}
        onClick={() => handleFeedback(1)}
      >
        Yes
      </button>
      <button
        className="btn btn-ghost"
        style={{
          padding: '8px 18px',
          fontSize: '0.9rem',
          borderColor: selected === 0 ? 'var(--error)' : undefined,
          color: selected === 0 ? 'var(--error)' : undefined,
        }}
        onClick={() => handleFeedback(0)}
      >
        Not really
      </button>
    </div>
  )
}
