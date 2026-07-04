import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { CATEGORY_COLORS } from '../data/categories.js'

// ─── RETURNING USER SCREEN ────────────────────────────────────────────────────

export function ReturningUserScreen({ saved, onContinue, onRestart }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-xs text-center"
        style={{
          opacity: phase ? 1 : 0,
          transform: phase ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
        <div className="text-6xl mb-4 animate-float">{saved.archetype.emoji}</div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#fd297b' }}>
          Welcome back
        </p>
        <h1 className="text-white text-3xl font-bold mb-2 leading-tight"
          style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em' }}>
          {saved.archetype.name}
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          You've already discovered your archetype. Pick up where you left off?
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {saved.liked.slice(0, 8).map(c => (
            <span key={c.id} className="px-3 py-1.5 rounded-full text-sm"
              style={{
                background: `${CATEGORY_COLORS[c.category]}12`,
                color: CATEGORY_COLORS[c.category],
                border: `1px solid ${CATEGORY_COLORS[c.category]}28`,
              }}>
              {c.emoji} {c.label}
            </span>
          ))}
          {saved.liked.length > 8 && (
            <span className="px-3 py-1.5 rounded-full text-sm" style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              +{saved.liked.length - 8} more
            </span>
          )}
        </div>

        <button onClick={onContinue}
          className="w-full py-4 rounded-2xl text-black font-bold text-base mb-3 transition-all duration-200 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)', boxShadow: '0 0 40px rgba(253,41,123,0.25)' }}>
          Continue to My Profile
        </button>
        <button onClick={onRestart}
          className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <RefreshCw size={13} className="inline mr-1.5" />
          Start fresh
        </button>
      </div>
    </div>
  )
}
