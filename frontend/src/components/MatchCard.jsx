import { useState } from 'react'
import FeedbackBar from './FeedbackBar'

function MatchPercentageBar({ pct }) {
  const color = pct >= 80 ? '#4ade80' : pct >= 60 ? 'var(--accent)' : '#fbbf24'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Match score</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ background: 'var(--surface-2)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 100,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

export default function MatchCard({ match }) {
  const [activeIdx, setActiveIdx] = useState(null)
  const top = match.top_matches || []
  const active = activeIdx === null ? null : top[activeIdx]

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 32 }}>
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
          Your matches are ready
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Top people to talk to</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Based on your profile we found {top.length} people worth meeting. Select one to see conversation starters.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {top.map((person, i) => (
          <div
            key={i}
            className="card"
            style={{
              cursor: 'pointer',
              borderColor: activeIdx === i ? 'rgba(108,99,255,0.5)' : undefined,
              boxShadow: activeIdx === i ? '0 0 20px rgba(108,99,255,0.08)' : undefined,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              padding: '20px 24px',
            }}
            onClick={() => setActiveIdx(i)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: activeIdx === i ? 'var(--accent)' : 'var(--text-secondary)',
                    minWidth: 20,
                  }}>
                    #{i + 1}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                    {person.name}
                  </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: 30 }}>
                  {person.role}{person.company ? ` at ${person.company}` : ''}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 30, marginTop: 4, lineHeight: 1.5 }}>
                  {person.what_you_do.length > 100 ? person.what_you_do.slice(0, 100) + '...' : person.what_you_do}
                </p>
              </div>
            </div>
            <div style={{ marginLeft: 30 }}>
              <MatchPercentageBar pct={person.match_percentage} />
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div
          onClick={() => setActiveIdx(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card fade-up"
            style={{
              maxWidth: 560,
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setActiveIdx(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>

            <h3 style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
              paddingRight: 32,
            }}>
              Conversation starters for {active.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(active.questions || match.questions).map((q, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}
                >
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--text)' }}>{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <FeedbackBar matchId={match.match_id} />
    </div>
  )
}