import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
          top: '20%', right: '10%', pointerEvents: 'none',
        }} />

        <div className="fade-up" style={{ position: 'relative', maxWidth: 640 }}>
          <div style={{
            display: 'inline-block', background: 'var(--accent-dim)',
            color: 'var(--accent)', border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 6, padding: '5px 14px', fontSize: '0.78rem',
            fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 32,
          }}>
            AI-Powered Professional Networking
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 4.5rem)',
            fontWeight: 800, marginBottom: 24, lineHeight: 1.05,
          }}>
            Skip the small talk.<br />
            <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start real conversations.
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: 44, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 44px' }}>
            IceBreaker matches you with the right people at every event and gives you personalized conversation starters — powered by AI, free to use.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 40px', width: 'auto' }}
              onClick={() => navigate('/events')}>
              Browse events →
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '1rem', padding: '16px 32px' }}
              onClick={() => navigate('/signup')}>
              Create free account
            </button>
          </div>

          <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No credit card · No paid API · 100% open source
          </p>
        </div>

        {/* Demo cards */}
        <div style={{ position: 'relative', marginTop: 72, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {demoCards.map((c, i) => (
            <div key={i} className="fade-up" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '20px 24px', maxWidth: 260, textAlign: 'left',
              animationDelay: `${i * 0.12}s`,
              boxShadow: i === 1 ? '0 0 40px rgba(108,99,255,0.12)' : 'none',
              borderColor: i === 1 ? 'rgba(108,99,255,0.3)' : undefined,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.role}</div>
                </div>
                <div style={{
                  background: i === 1 ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: i === 1 ? 'var(--accent)' : 'var(--text-secondary)',
                  borderRadius: 6, padding: '3px 9px', fontSize: '0.78rem', fontWeight: 600,
                }}>{c.pct}% match</div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{c.desc}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500 }}>5 conversation starters →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <SectionBadge>How it works</SectionBadge>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 16 }}>
            From sign-up to conversation<br />in under 2 minutes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 64, maxWidth: 500, margin: '0 auto 64px' }}>
            No awkward introductions. No wasted time hunting for the right person.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'left', position: 'relative' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 20,
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(167,139,250,0.1))',
                  border: '1px solid rgba(108,99,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>{s.icon}</div>
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                  transform: 'translate(-6px, -6px)',
                }}>{i + 1}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <SectionBadge>Features</SectionBadge>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 56 }}>
            Everything you need to connect
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, textAlign: 'left' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '28px',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ─────────────────────────────────────────────── */}
      <section id="demo" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge>Demo</SectionBadge>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 16 }}>
              See it in action
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Here's what you get after registering for an event.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
            {/* Mock browser bar */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 12 }}>
                icebreaker.app/match/ai-summit-2026
              </div>
            </div>

            <div style={{ padding: '32px 24px' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 4 }}>Your Top Matches</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI Summit 2026 · 5 matches found</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {demoMatches.map((m, i) => (
                  <div key={i} style={{
                    background: 'var(--surface)', border: `1px solid ${i === 0 ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '18px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    boxShadow: i === 0 ? '0 0 24px rgba(108,99,255,0.08)' : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${m.color1}, ${m.color2})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                        }}>{m.initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.role} · {m.company}</div>
                        </div>
                      </div>
                      {i === 0 && (
                        <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conversation Starters</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {m.questions.map((q, qi) => (
                              <div key={qi} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 10, borderLeft: '2px solid rgba(108,99,255,0.4)' }}>
                                {q}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: i === 0 ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.05)',
                      color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)',
                      borderRadius: 8, padding: '6px 12px', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                    }}>{m.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, marginBottom: 20 }}>
            Ready to network smarter?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 40, lineHeight: 1.7 }}>
            Create your free account in 30 seconds. No credit card. No catch.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 40px', width: 'auto' }}
              onClick={() => navigate('/signup')}>
              Get started free →
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '1rem', padding: '16px 32px' }}
              onClick={() => navigate('/events')}>
              Browse events
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>✦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>IceBreaker</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: 8 }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <FooterLink onClick={() => navigate('/events')}>Events</FooterLink>
            <FooterLink onClick={() => navigate('/create-event')}>Host an event</FooterLink>
            <FooterLink onClick={() => window.open('https://github.com/ShrutiSunilSawant/IceBreaker-AI-Networking-Platform', '_blank')}>GitHub</FooterLink>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SectionBadge({ children }) {
  return (
    <div style={{
      display: 'inline-block', background: 'var(--accent-dim)', color: 'var(--accent)',
      border: '1px solid rgba(108,99,255,0.3)', borderRadius: 6,
      padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
    }}>{children}</div>
  )
}

function FooterLink({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'var(--font-body)', transition: 'color 0.2s' }}
      onMouseEnter={e => e.target.style.color = '#fff'}
      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
    >{children}</button>
  )
}

const demoCards = [
  { name: 'Alex Chen', role: 'ML Engineer · Google', pct: 94, desc: 'Working on distributed training infra for large vision models.' },
  { name: 'Priya Nair', role: 'AI Researcher · DeepMind', pct: 91, desc: 'Exploring alignment techniques for multi-agent systems.' },
  { name: 'Jordan Kim', role: 'Founder · Stealth AI', pct: 87, desc: 'Building developer tools for LLM evaluation at scale.' },
]

const steps = [
  { icon: '📋', title: 'Register for an event', desc: 'Fill out a short profile describing your work, what you\'re looking for, and your interests. Takes under 2 minutes.' },
  { icon: '🤖', title: 'AI finds your matches', desc: 'Our 13-node AI pipeline embeds your profile, searches the event pool semantically, and ranks your top 5 compatible matches.' },
  { icon: '💬', title: 'Get conversation starters', desc: 'For each match you get 5 personalized, domain-specific questions — work-focused or hobby-focused, never a generic mix.' },
  { icon: '🤝', title: 'Walk up and connect', desc: 'Use your starters at the event. No awkward "so what do you do?" — you already know what to say.' },
]

const features = [
  { icon: '🧠', title: 'Semantic Matching', desc: 'Uses 384-dimensional sentence embeddings (all-MiniLM-L6-v2) to find people who genuinely complement your work, not just keyword matches.' },
  { icon: '✨', title: 'AI Conversation Starters', desc: 'Llama 3.1 generates 5 personalized questions per match — specific to both your profiles, never generic or canned.' },
  { icon: '🎯', title: 'Domain Separation', desc: 'Questions are either entirely work-focused or entirely hobby-focused. Never a forced analogy between the two.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Raw emails are never stored. SHA-256 hashes serve as identifiers across events, enabling conflict detection without exposing PII.' },
  { icon: '📅', title: 'Multi-Event Support', desc: 'Attend multiple events simultaneously. Built-in conflict detection warns you if two events overlap.' },
  { icon: '💸', title: 'Completely Free', desc: 'Built on open-source tools. Local embeddings, free-tier Groq API. Zero operating cost, deployable anywhere.' },
]

const demoMatches = [
  {
    name: 'Priya Nair', role: 'AI Researcher', company: 'DeepMind', pct: 94,
    initials: 'PN', color1: '#6c63ff', color2: '#a78bfa',
    questions: [
      'You\'re working on alignment for multi-agent systems — where do you think the coordination problem is hardest?',
      'What\'s a failure mode in your current research that doesn\'t show up in benchmarks?',
    ],
  },
  { name: 'Alex Chen', role: 'ML Engineer', company: 'Google', pct: 89, initials: 'AC', color1: '#0ea5e9', color2: '#38bdf8', questions: [] },
  { name: 'Jordan Kim', role: 'Founder', company: 'Stealth AI', pct: 84, initials: 'JK', color1: '#10b981', color2: '#34d399', questions: [] },
]
