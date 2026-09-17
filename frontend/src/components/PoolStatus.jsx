export default function PoolStatus({ poolSize, needed, message }) {
  const MIN = poolSize + needed
  const pct = Math.round((poolSize / MIN) * 100)

  return (
    <div className="card fade-up" style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-block',
        background: 'rgba(251,191,36,0.1)',
        color: '#fbbf24',
        border: '1px solid rgba(251,191,36,0.25)',
        borderRadius: 6,
        padding: '4px 12px',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: 20,
      }}>
        Almost there
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
        Matching opens soon
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
        {message}
      </p>

      <div style={{
        background: 'var(--surface-2)',
        borderRadius: 100,
        height: 6,
        overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--accent)',
          borderRadius: 100,
          transition: 'width 0.4s ease',
          boxShadow: '0 0 12px var(--accent-glow)',
        }} />
      </div>

      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {poolSize} of {MIN} people registered
      </span>
    </div>
  )
}
