import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { AuthLayout, LoadingDots } from './Signup'

export default function Signin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/users/signin', { email: form.email, password: form.password })
      localStorage.setItem('platform_token', res.data.access_token)
      localStorage.setItem('platform_user', JSON.stringify({ display_name: res.data.display_name, email: res.data.email }))
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your IceBreaker account.">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required autoFocus autoComplete="off" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Your password" value={form.password} onChange={set('password')} required autoComplete="current-password" />
        </div>

        <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 20 }}>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Forgot password?
          </Link>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ fontSize: '1.05rem', padding: '16px' }}>
          {loading ? <LoadingDots /> : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)' }}>Create one</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
