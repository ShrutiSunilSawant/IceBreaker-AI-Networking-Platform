import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { AuthLayout, LoadingDots } from './Signup'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState('request') // 'request' | 'reset' | 'done'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [devToken, setDevToken] = useState(null)

  const handleRequest = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/users/forgot-password', { email })
      if (res.data.dev_token) {
        setDevToken(res.data.dev_token)
        setToken(res.data.dev_token)
      }
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await api.post('/users/reset-password', { token, new_password: newPassword })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired token.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <AuthLayout title="Password reset!" sub="You can now sign in with your new password.">
        <div className="success-msg">Your password has been updated successfully.</div>
        <Link to="/signin">
          <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '16px', marginTop: 8 }}>
            Go to sign in →
          </button>
        </Link>
      </AuthLayout>
    )
  }

  if (step === 'reset') {
    return (
      <AuthLayout title="Reset your password" sub="Enter your reset token and choose a new password.">
        <form onSubmit={handleReset}>
          {error && <div className="error-msg">{error}</div>}

          {devToken && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '12px 14px', fontSize: '0.82rem', wordBreak: 'break-all', marginBottom: 16 }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 4, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dev mode only — token shown here instead of email</div>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{devToken}</span>
            </div>
          )}

          <div className="field">
            <label>Reset token</label>
            <input type="text" placeholder="Paste token from email" value={token}
              onChange={e => setToken(e.target.value)} required />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" placeholder="Min. 8 characters" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" placeholder="Same password again" value={confirm}
              onChange={e => setConfirm(e.target.value)} required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ fontSize: '1.05rem', padding: '16px' }}>
            {loading ? <LoadingDots /> : 'Reset password'}
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot password?" sub="Enter your email and we'll send a reset link.">
      <form onSubmit={handleRequest}>
        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@company.com" value={email}
            onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ fontSize: '1.05rem', padding: '16px' }}>
          {loading ? <LoadingDots /> : 'Send reset link'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Remembered it?{' '}
          <Link to="/signin" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
