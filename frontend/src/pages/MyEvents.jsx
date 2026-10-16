import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvent, unregisterFromEvent } from '../utils/api'
import { getMyEvents, getCreatedEvents, getStoredEventId, saveEventId, getStoredUserId, removeEventFromStorage } from '../utils/auth'
import EventPrep from '../components/EventPrep'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getEventStatus(date, endTime, durationHours = 3) {
  const now = new Date()
  const start = new Date(date)
  const end = endTime ? new Date(endTime) : new Date(start.getTime() + durationHours * 60 * 60 * 1000)
  if (now < start) return 'upcoming'
  if (now >= start && now <= end) return 'ongoing'
  return 'ended'
}

function useCountdown(date, endTime, durationHours = 3) {
  const [display, setDisplay] = useState('')
  const [status, setStatus] = useState('upcoming')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const start = new Date(date)
      const end = endTime ? new Date(endTime) : new Date(start.getTime() + durationHours * 60 * 60 * 1000)

      if (now >= end) {
        setDisplay('Event ended')
        setStatus('ended')
        return
      }

      if (now >= start && now < end) {
        const remaining = end - now
        const hrs = Math.floor(remaining / (1000 * 60 * 60))
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((remaining % (1000 * 60)) / 1000)
        setDisplay(`Ongoing, ends in ${hrs}h ${mins}m ${secs}s`)
        setStatus('ongoing')
        return
      }

      const diff = start - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) setDisplay(`Starts in ${days}d ${hours}h ${mins}m`)
      else if (hours > 0) setDisplay(`Starts in ${hours}h ${mins}m ${secs}s`)
      else setDisplay(`Starts in ${mins}m ${secs}s`)
      setStatus('upcoming')
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [date, durationHours])

  return { display, status }
}

function StatusBadge({ date, endTime, durationHours }) {
  const { display, status } = useCountdown(date, endTime, durationHours)

  const styles = {
    ongoing: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' },
    upcoming: { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(108,99,255,0.3)' },
    ended: { color: 'var(--text-secondary)', bg: 'var(--surface-2)', border: 'var(--border)' },
  }

  const s = styles[status]

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 20,
      padding: '3px 10px',
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {display}
    </span>
  )
}

export default function MyEvents() {
  const navigate = useNavigate()
  const [attendingEvents, setAttendingEvents] = useState([])
  const [createdEvents, setCreatedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [prepOpen, setPrepOpen] = useState(null)
  const [prepCache, setPrepCache] = useState({})
  const [unregistering, setUnregistering] = useState(null)
  const [unregisterSuccess, setUnregisterSuccess] = useState(null)
  const currentEventId = getStoredEventId()

  // keep backward compat
  const events = attendingEvents

  useEffect(() => {
    const attendingIds = getMyEvents()
    const createdIds = getCreatedEvents()
    const allIds = [...new Set([...attendingIds, ...createdIds])]
    if (allIds.length === 0) { setLoading(false); return }
    Promise.all(allIds.map(id => getEvent(id).then(r => r.data).catch(() => null)))
      .then(results => {
        const byId = {}
        results.filter(Boolean).forEach(e => { byId[e.id] = e })
        const attending = attendingIds.map(id => byId[id]).filter(Boolean)
        const created = createdIds.map(id => byId[id]).filter(Boolean)
        attending.sort((a, b) => new Date(a.date) - new Date(b.date))
        created.sort((a, b) => new Date(a.date) - new Date(b.date))
        setAttendingEvents(attending)
        setCreatedEvents(created)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (eventId) => {
    saveEventId(eventId)
    navigate('/match')
  }

  const handleUnregister = async (event) => {
    const confirmed = window.confirm(`Unregister from "${event.name}"? This cannot be undone.`)
    if (!confirmed) return

    setUnregistering(event.id)
    const userId = getStoredUserId(event.id)

    try {
      await unregisterFromEvent(userId, event.id)
      removeEventFromStorage(event.id)
      setAttendingEvents(prev => prev.filter(e => e.id !== event.id))
      if (prepOpen === event.id) setPrepOpen(null)
      setUnregisterSuccess(`You have been unregistered from "${event.name}".`)
      setTimeout(() => setUnregisterSuccess(null), 4000)
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(detail || 'Could not unregister. Please try again.')
    } finally {
      setUnregistering(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/events')}>
            Browse more events
          </button>
          <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/')}>
            Home
          </button>
        </div>

        {unregisterSuccess && (
          <div style={{
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '12px 16px',
            color: '#4ade80', fontSize: '0.9rem', marginBottom: 16,
          }} className="fade-up">
            {unregisterSuccess}
          </div>
        )}

        <div className="fade-up" style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>My Events</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Events you are attending or have created.
          </p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
                animation: 'pulse 1.5s ease infinite',
              }}>
                <div style={{ height: 18, width: '40%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 10 }} />
                <div style={{ height: 14, width: '60%', background: 'var(--surface-2)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && attendingEvents.length === 0 && createdEvents.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              You are not registered for any events.
            </p>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 28px' }}
              onClick={() => navigate('/events')}>Browse events</button>
          </div>
        )}

        {/* Events I Created */}
        {!loading && createdEvents.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Events Created
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {createdEvents.map((event, i) => {
                const isCancelled = event.cancelled
                const isEnded = getEventStatus(event.date, event.end_time, event.duration_hours || 3) === 'ended'
                const token = localStorage.getItem(`organizer_token_${event.id}`)
                return (
                  <div key={event.id} className="card fade-up" style={{
                    animationDelay: `${i * 0.08}s`,
                    borderColor: 'rgba(108,99,255,0.3)',
                    opacity: isEnded ? 0.6 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: '1.1rem' }}>{event.name}</h2>
                          <StatusBadge date={event.date} endTime={event.end_time} durationHours={event.duration_hours || 3} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatDate(event.date)}</span>
                          {event.location && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.location}</span>}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost"
                        style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/manage-event/${event.id}?token=${token}`)}
                      >
                        Manage event →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Events I'm Attending */}
        {!loading && attendingEvents.length > 0 && (
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Events Attending
          </h2>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {attendingEvents.map((event, i) => {
            const isActive = event.id === currentEventId
            const isPrepOpen = prepOpen === event.id
            const isUnregistering = unregistering === event.id
            const isEnded = getEventStatus(event.date, event.end_time, event.duration_hours || 3) === 'ended'


            return (
              <div
                key={event.id}
                className="card fade-up"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  borderColor: isEnded
                    ? 'var(--border)'
                    : isActive
                    ? 'rgba(108,99,255,0.5)'
                    : undefined,
                  boxShadow: isActive && !isEnded ? '0 0 24px rgba(108,99,255,0.08)' : undefined,
                  opacity: isUnregistering ? 0.5 : (isEnded || isCancelled) ? 0.6 : 1,
                  transition: 'opacity 0.2s, border-color 0.2s',
                }}
              >
                {/* Header row */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h2 style={{
                          fontSize: '1.1rem',
                          color: (isEnded || isCancelled) ? 'var(--text-secondary)' : 'var(--text)',
                        }}>
                          {event.name}
                        </h2>
                        {isCancelled ? (
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--error)',
                            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                            borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
                          }}>Cancelled</span>
                        ) : (
                          <StatusBadge date={event.date} endTime={event.end_time} durationHours={event.duration_hours || 3} />
                        )}

                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {formatDate(event.date)}
                        </span>
                        {event.location && (
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                      {!isEnded && !isCancelled && (
                        <div
                          style={{
                            background: isActive ? 'var(--accent)' : 'var(--accent-dim)',
                            color: isActive ? '#fff' : 'var(--accent)',
                            border: '1px solid rgba(108,99,255,0.3)',
                            borderRadius: 6, padding: '6px 14px',
                            fontSize: '0.8rem', fontWeight: 600,
                            whiteSpace: 'nowrap', cursor: 'pointer',
                          }}
                          onClick={() => handleSelect(event.id)}
                        >
                          Find connections
                        </div>
                      )}
                      {!isCancelled && (
                        <div
                          style={{
                            background: isPrepOpen ? 'var(--accent)' : 'var(--accent-dim)',
                            color: isPrepOpen ? '#fff' : 'var(--accent)',
                            border: '1px solid rgba(108,99,255,0.3)',
                            borderRadius: 6, padding: '6px 14px',
                            fontSize: '0.8rem', fontWeight: 600,
                            whiteSpace: 'nowrap', cursor: 'pointer',
                          }}
                          onClick={() => setPrepOpen(isPrepOpen ? null : event.id)}
                        >
                          ✦ AI Prep
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Prep panel */}
                {isPrepOpen && (
                  <div className="fade-up" style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <EventPrep
                      eventId={event.id}
                      cachedPrep={prepCache[event.id]}
                      onPrepLoaded={(data) => setPrepCache(prev => ({ ...prev, [event.id]: data }))}
                    />
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'rgba(248,113,113,0.2)', width: 'auto' }}
                        disabled={isUnregistering}
                        onClick={() => handleUnregister(event)}
                      >
                        {isUnregistering ? 'Unregistering...' : 'Unregister from this event'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}