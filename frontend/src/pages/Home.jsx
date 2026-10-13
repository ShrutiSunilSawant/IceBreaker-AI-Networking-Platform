import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
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
            Professional Networking, Reimagined
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

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 44px' }}>
            IceBreaker matches you with the right people at every event and gives you personalized conversation starters powered by AI.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 40px', width: 'auto' }}
              onClick={() => navigate('/signup')}>
              Get started
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '1rem', padding: '16px 32px' }}
              onClick={() => navigate('/signin')}>
              Sign in
            </button>
          </div>
        </div>

        {/* Hero demo cards */}
        <div style={{ position: 'relative', marginTop: 72, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {heroCards.map((c, i) => (
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
              <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500 }}>5 conversation starters</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <SectionBadge>How it works</SectionBadge>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 16 }}>
            From sign-up to conversation in under 2 minutes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 64, maxWidth: 500, margin: '0 auto 64px' }}>
            No awkward introductions. No wasted time hunting for the right person.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
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

      {/* Features */}
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

      {/* Product Overview */}
      <section id="overview" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge>Product Overview</SectionBadge>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 16 }}>
              Built for every role in the room
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              Whether you are hosting or attending, IceBreaker has a clear path for you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {overviewCards.map((card, i) => (
              <div key={i} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '32px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${card.color1}, ${card.color2})`,
                }} />
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{card.icon}</div>
                <div style={{
                  display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
                  color: card.labelColor, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: card.labelBg, borderRadius: 4, padding: '3px 10px', marginBottom: 14,
                }}>{card.label}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: 12 }}>{card.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 20 }}>{card.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {card.bullets.map((b, bi) => (
                    <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: card.labelColor, fontWeight: 700, flexShrink: 0 }}>+</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(card.cta.path)}
                  style={{
                    marginTop: 24, background: 'none', border: `1px solid ${card.labelColor}`,
                    color: card.labelColor, borderRadius: 8, padding: '10px 20px',
                    fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = card.labelBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >{card.cta.label}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge>Demo</SectionBadge>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 16 }}>
              Here is what happens when you register
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              Follow the steps below. The whole flow takes under 2 minutes.
            </p>
          </div>

          {/* Step-by-step demo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Step 1 */}
            <DemoStep number="1" title="Fill in your profile at the event page">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 16 }}>
                When you open an event link, you will see a short form. Tell us who you are, what you work on, and what you are hoping to get out of the event. This takes about 60 seconds.
              </p>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Name and role', 'What you work on right now', 'Who you want to meet', 'Hobbies and interests'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700 }}>{i + 1}</div>
                    <div style={{ height: 10, flex: 1, background: 'var(--surface)', borderRadius: 4 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 120 }}>{f}</span>
                  </div>
                ))}
              </div>
            </DemoStep>

            {/* Step 2 */}
            <DemoStep number="2" title="The AI finds your best matches">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 16 }}>
                After you submit, the system embeds your profile and searches everyone else at the event. It picks the 5 people whose goals and background complement yours most closely, then ranks them by compatibility.
              </p>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Matching complete. 5 people found at AI Summit 2026.</span>
                </div>
                {demoMatchRows.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${m.c1}, ${m.c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.init}</div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.role}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>{m.pct}%</div>
                  </div>
                ))}
              </div>
            </DemoStep>

            {/* Step 3 */}
            <DemoStep number="3" title="Click any match to see your conversation starters">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 16 }}>
                Tap a match card to open 5 questions written specifically for both of you. Some questions are about your work. Others are about your hobbies. They are never mixed so you always have a natural way to open the conversation.
              </p>
              <div style={{ background: 'var(--bg)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '20px', boxShadow: '0 0 24px rgba(108,99,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>PN</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Priya Nair</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>AI Researcher</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', borderRadius: 6, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 700 }}>94%</div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Your conversation starters</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {demoQuestions.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DemoStep>

            {/* Step 4 */}
            <DemoStep number="4" title="Walk up and start the conversation">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                Find your matches at the event and use the starters. You already know what they work on and what to ask. No generic icebreakers, no awkward openers, just a real conversation from the first sentence.
              </p>
            </DemoStep>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px', textAlign: 'center', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, marginBottom: 20 }}>
            Ready to network smarter?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 40, lineHeight: 1.7 }}>
            Create your account and browse upcoming events in seconds.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 40px', width: 'auto' }}
              onClick={() => navigate('/signup')}>
              Get started
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '1rem', padding: '16px 32px' }}
              onClick={() => navigate('/signin')}>
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>✦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>IceBreaker</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: 8 }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <FooterLink onClick={() => navigate('/signin')}>Sign in</FooterLink>
            <FooterLink onClick={() => navigate('/signup')}>Create account</FooterLink>
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

function DemoStep({ number, title, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(167,139,250,0.15))',
          border: '1px solid rgba(108,99,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)',
        }}>{number}</div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 14 }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

const heroCards = [
  { name: 'Alex Chen', role: 'ML Engineer', pct: 94, desc: 'Working on distributed training infrastructure for large vision models.' },
  { name: 'Priya Nair', role: 'AI Researcher', pct: 91, desc: 'Exploring alignment techniques for multi-agent systems.' },
  { name: 'Jordan Kim', role: 'Founder', pct: 87, desc: 'Building developer tools for LLM evaluation at scale.' },
]

const steps = [
  { icon: '📋', title: 'Register for an event', desc: 'Fill out a short profile describing your work, what you are looking for, and your interests. Takes under 2 minutes.' },
  { icon: '🤖', title: 'AI finds your matches', desc: 'The system embeds your profile and searches the event pool to rank your top 5 most compatible matches.' },
  { icon: '💬', title: 'Get conversation starters', desc: 'For each match you get 5 personalized questions, either work-focused or hobby-focused, never generic.' },
  { icon: '🤝', title: 'Walk up and connect', desc: 'Use your starters at the event. You already know what to say before you say hello.' },
]

const features = [
  { icon: '🧠', title: 'Semantic Matching', desc: 'Finds people who genuinely complement your work, not just keyword matches. Powered by sentence embeddings running locally.' },
  { icon: '✨', title: 'Personalized Starters', desc: 'Every question is written specifically for you and your match. Nothing generic, nothing recycled.' },
  { icon: '🎯', title: 'Domain Separation', desc: 'Questions are either entirely about your work or entirely about your hobbies. Never a forced mix of the two.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Your email is hashed and never stored in plain text. We identify you across events without ever exposing your personal data.' },
  { icon: '📅', title: 'Multi-Event Support', desc: 'Attend multiple events at once. The system automatically warns you if two events overlap in time.' },
]

const overviewCards = [
  {
    icon: '🎟', label: 'For Attendees', labelColor: '#a78bfa', labelBg: 'rgba(167,139,250,0.12)',
    color1: '#6c63ff', color2: '#a78bfa',
    title: 'Find the right people at every event',
    desc: 'You show up, fill in a quick profile, and leave with five names to talk to and exactly what to say to each of them.',
    bullets: ['Register in under 2 minutes', 'Get 5 ranked matches with compatibility scores', 'See 5 conversation starters per match', 'Works at any event you are invited to'],
    cta: { label: 'Get started', path: '/signup' },
  },
  {
    icon: '🏛', label: 'For Organizers', labelColor: '#4ade80', labelBg: 'rgba(74,222,128,0.1)',
    color1: '#4ade80', color2: '#34d399',
    title: 'Run a better networking event',
    desc: 'Create an event in seconds, share the link with your attendees, and let the platform handle all the matching automatically.',
    bullets: ['Create and manage events from a dashboard', 'Attendees self-register with no extra setup', 'Matching opens automatically once enough people join', 'Monitor attendance and activity in real time'],
    cta: { label: 'Create an event', path: '/create-event' },
  },
]

const demoMatchRows = [
  { init: 'PN', name: 'Priya Nair', role: 'AI Researcher', pct: 94, c1: '#6c63ff', c2: '#a78bfa' },
  { init: 'AC', name: 'Alex Chen', role: 'ML Engineer', pct: 89, c1: '#0ea5e9', c2: '#38bdf8' },
  { init: 'JK', name: 'Jordan Kim', role: 'Founder', pct: 84, c1: '#10b981', c2: '#34d399' },
  { init: 'SM', name: 'Sara Malik', role: 'Product Lead', pct: 79, c1: '#f59e0b', c2: '#fbbf24' },
  { init: 'DL', name: 'David Lin', role: 'Research Engineer', pct: 73, c1: '#ec4899', c2: '#f472b6' },
]

const demoQuestions = [
  'You are both working on inference optimization. What is the biggest performance gain you have found that most people overlook?',
  'Your work touches on alignment for multi-agent systems. What does a failure look like in practice?',
  'You both climb. What is a route that completely changed how you think about risk?',
]
