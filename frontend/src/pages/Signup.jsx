import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ display_name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const res = await api.post('/users/signup', {
        display_name: form.display_name,
        email: form.email,
        password: form.password,
      })
      localStorage.setItem('platform_token', res.data.access_token)
      localStorage.setItem('platform_user', JSON.stringify({ display_name: res.data.display_name, email: res.data.email }))
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" sub="Join IceBreaker to start networking smarter.">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>Display name</label>
          <input type="text" placeholder="Jane Smith" value={form.display_name} onChange={set('display_name')} required autoFocus autoComplete="off" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required autoComplete="off" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
        </div>
        <div className="field">
          <label>Confirm password</label>
          <input type="password" placeholder="Same password again" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ fontSize: '1.05rem', padding: '16px', marginTop: 8 }}>
          {loading ? <LoadingDots /> : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function AuthLayout({ title, sub, children }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <button className="btn btn-ghost" style={{ marginBottom: 28, padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => navigate('/')}>← Back</button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', marginBottom: 8 }}>{title}</h1>
          {sub && <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{sub}</p>}
        </div>

        {children}
      </div>
    </div>
  )
}

export function LoadingDots() {
  return (
    <span style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </span>
  )
}
