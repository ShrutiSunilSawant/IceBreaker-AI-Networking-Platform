import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('platform_user')
    if (stored) setUser(JSON.parse(stored))
  }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('platform_token')
    localStorage.removeItem('platform_user')
    setUser(null)
    navigate('/')
  }

  const isHome = location.pathname === '/'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || !isHome ? 'rgba(10,10,15,0.92)' : 'transparent',
      backdropFilter: scrolled || !isHome ? 'blur(12px)' : 'none',
      borderBottom: scrolled || !isHome ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: '#fff',
          }}>✦</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
            IceBreaker
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
          <a href="/#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textDecoration: 'none' }}
            onClick={e => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) }}>
            How it works
          </a>
          <a href="/#features" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textDecoration: 'none' }}
            onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}>
            Features
          </a>
        </div>

        {/* Auth area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(m => !m)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 16px', color: 'var(--text)',
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {user.display_name?.[0]?.toUpperCase() || '?'}
                </div>
                {user.display_name}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>▾</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '8px', minWidth: 180,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <DropItem onClick={() => { setMenuOpen(false); navigate('/settings') }}>⚙ Settings</DropItem>
                  <DropItem onClick={() => { setMenuOpen(false); navigate('/create-event') }}>＋ Create Event</DropItem>
                  <DropItem onClick={() => { setMenuOpen(false); navigate('/my-events') }}>📋 My Events</DropItem>
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <DropItem onClick={() => { setMenuOpen(false); handleSignOut() }} danger>↩ Sign out</DropItem>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="btn btn-ghost"
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
                onClick={() => navigate('/signin')}
              >
                Sign in
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.9rem', width: 'auto' }}
                onClick={() => navigate('/signup')}
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textDecoration: 'none',
      transition: 'color 0.2s' }}
      onMouseEnter={e => e.target.style.color = '#fff'}
      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
    >
      {children}
    </Link>
  )
}

function DropItem({ onClick, danger, children }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'none', border: 'none',
      color: danger ? 'var(--error)' : 'var(--text)', textAlign: 'left',
      padding: '9px 12px', borderRadius: 7, cursor: 'pointer',
      fontSize: '0.9rem', fontFamily: 'var(--font-body)',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {children}
    </button>
  )
}
