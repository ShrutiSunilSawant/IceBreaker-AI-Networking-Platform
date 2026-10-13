import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameStatus, setNameStatus] = useState(null) // {type, msg}
  const [pwStatus, setPwStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('platform_user')
    if (!stored) { navigate('/signin'); return }
    const u = JSON.parse(stored)
    setUser(u)
    setDisplayName(u.display_name || '')
  }, [])

  const getAuthHeader = () => {
    const token = localStorage.getItem('platform_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) { setNameStatus({ type: 'error', msg: 'Display name cannot be empty.' }); return }
    setLoading(true)
    setNameStatus(null)
    try {
      const res = await api.patch('/users/settings', { display_name: displayName.trim() }, { headers: getAuthHeader() })
      const updated = { ...user, display_name: res.data.display_name }
      localStorage.setItem('platform_user', JSON.stringify(updated))
      setUser(updated)
      setNameStatus({ type: 'success', msg: 'Display name updated.' })
    } catch (err) {
      setNameStatus({ type: 'error', msg: err.response?.data?.detail || 'Update failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPwStatus(null)
    if (newPassword !== confirmPassword) { setPwStatus({ type: 'error', msg: 'Passwords do not match.' }); return }
    if (newPassword.length < 8) { setPwStatus({ type: 'error', msg: 'Password must be at least 8 characters.' }); return }
    setPwLoading(true)
    try {
      await api.patch('/users/settings', { current_password: currentPassword, new_password: newPassword }, { headers: getAuthHeader() })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwStatus({ type: 'success', msg: 'Password updated successfully.' })
    } catch (err) {
      setPwStatus({ type: 'error', msg: err.response?.data?.detail || 'Update failed.' })
    } finally {
      setPwLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('platform_token')
    localStorage.removeItem('platform_user')
    navigate('/')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 88, padding: '88px 24px 48px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 8 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 48 }}>Manage your IceBreaker account.</p>

          {/* Profile card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 700, color: '#fff',
            }}>{user.display_name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{user.display_name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</div>
            </div>
          </div>

          {/* Display name */}
          <Section title="Display Name">
            <form onSubmit={handleUpdateName}>
              {nameStatus && <div className={nameStatus.type === 'error' ? 'error-msg' : 'success-msg'}>{nameStatus.msg}</div>}
              <div className="field">
                <label>Name shown to other attendees</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width: 'auto', padding: '12px 28px', fontSize: '0.95rem' }}>
                {loading ? 'Saving…' : 'Save name'}
              </button>
            </form>
          </Section>

          {/* Change password */}
          <Section title="Change Password">
            <form onSubmit={handleUpdatePassword}>
              {pwStatus && <div className={pwStatus.type === 'error' ? 'error-msg' : 'success-msg'}>{pwStatus.msg}</div>}
              <div className="field">
                <label>Current password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Your current password" />
              </div>
              <div className="field">
                <label>New password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Same password again" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={pwLoading}
                style={{ width: 'auto', padding: '12px 28px', fontSize: '0.95rem' }}>
                {pwLoading ? 'Saving…' : 'Update password'}
              </button>
            </form>
          </Section>

          {/* Sign out */}
          <Section title="Sign Out">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
              You'll stay signed in to any events you've registered for.
            </p>
            <button onClick={handleSignOut}
              style={{
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                color: 'var(--error)', borderRadius: 8, padding: '12px 24px',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
            >
              Sign out
            </button>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', marginBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: 20 }}>{title}</h2>
      {children}
    </div>
  )
}
