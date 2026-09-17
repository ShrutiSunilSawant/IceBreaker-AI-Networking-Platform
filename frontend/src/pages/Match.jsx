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
      setError(err.response?.data?.detail || 'Could not find a match. Please try again.')
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
          <div style={{ paddingTop: 48 }} className="fade-up">
            <div className="error-msg">{error}</div>
            <button className="btn btn-primary" onClick={fetchMatch}>Try again</button>
          </div>
        )}
      </div>
    </div>
  )
}