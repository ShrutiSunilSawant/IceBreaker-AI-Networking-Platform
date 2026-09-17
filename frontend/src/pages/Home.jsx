import { useNavigate } from 'react-router-dom'
import { isLoggedIn } from '../utils/auth'

export default function Home() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{ position: 'relative', maxWidth: 580 }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: 6,
          padding: '5px 14px',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}>
          Professional Networking, Reimagined
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          marginBottom: 20,
          lineHeight: 1.05,
        }}>
          Skip the small talk.<br />Start real conversations.
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          marginBottom: 40,
          lineHeight: 1.7,
        }}>
          We match you with the right people at every event and give you the exact questions to break the ice. No awkward intros, no wasted time.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: '1.05rem', padding: '16px 40px', width: 'auto' }}
            onClick={() => navigate('/events')}
          >
            Browse events
          </button>
          <button
            className="btn btn-primary"
            style={{
              fontSize: '1.05rem',
              padding: '16px 40px',
              width: 'auto',
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
            }}
            onClick={() => navigate(loggedIn ? '/my-events' : '/login')}
          >
            {loggedIn ? 'My events' : 'Sign in'}
          </button>
        </div>

        <p style={{
          marginTop: 20,
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          Register for an event in under 2 minutes.
        </p>
      </div>
    </div>
  )
}