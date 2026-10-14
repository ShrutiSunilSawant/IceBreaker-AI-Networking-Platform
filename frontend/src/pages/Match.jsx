import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findMatch, deactivateProfile } from '../utils/api'
import { getStoredUserId, getStoredEventId, isLoggedIn } from '../utils/auth'
import MatchCard from '../components/MatchCard'
import PoolStatus from '../components/PoolStatus'

export default function Match() {
  const navigate = useNavigate()
  const [state, setState] = useState('loading')
  const [match, setMatch] = useState(null)
  const [poolInfo, setPoolInfo] = useState(null)
  const [error, setError] = useState(null)

  const eventId = getStoredEventId()
  const userId = getStoredUserId(eventId)

  useEffect(() => {
    if (!isLoggedIn() || !userId) { navigate('/events'); return }
    fetchMatch()
  }, [])

  const fetchMatch = async () => {
    setState('loading')
    try {
      const res = await findMatch(userId, eventId)
      const data = res.data
      if (data.waiting) { setPoolInfo(data); setState('waiting') }
      else { setMatch(data); setState('matched') }
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail || ''
      if (status === 403 || status === 401 || detail.toLowerCase().includes('not authorized')) {
        setError('Your session has expired. Please go back to the event and sign in again.')
      } else if (status === 429) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (status === 404 && detail.toLowerCase().includes('profile')) {
        setError('Your profile was not found. Please go back and register for this event first.')
      } else {
        setError(detail || 'Could not find a match. Please try again.')
      }
      setState('error')
    }
  }

  const handleLeave = async () => {
    try { await deactivateProfile(userId, eventId) } catch {}
    navigate('/my-events')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div className="container">
        <button className="btn btn-ghost" style={{ marginBottom: 32, padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/my-events')}>
          My events
        </button>

        {state === 'loading' && (
          <div style={{ textAlign: 'center', paddingTop: 80 }} className="fade-up">
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Finding your matches...</p>
          </div>
        )}

        {state === 'waiting' && poolInfo && (
          <>
            <PoolStatus poolSize={poolInfo.pool_size} needed={poolInfo.needed} message={poolInfo.message} />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.9rem' }} onClick={fetchMatch}>Check again</button>
            </div>
          </>
        )}

        {state === 'matched' && match && (
          <>
            <MatchCard match={match} />
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.875rem' }} onClick={handleLeave}>
                I am done for the night
              </button>
            </div>
          </>
        )}

        {state === 'error' && (
          <div style={{ paddingTop: 48, maxWidth: 480, margin: '0 auto', textAlign: 'center' }} className="fade-up">
            <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Not enough attendees yet</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
              {error}
            </p>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={fetchMatch}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}