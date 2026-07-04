import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { SEED_PROFILES } from '../data/seedProfiles.js'

// ─── MATCHES SCREEN ───────────────────────────────────────────────────────────

export function MatchesScreen({ onNext }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0a0a0f' }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌐</div>
          <h1 className="text-white mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em' }}>Your Tribe</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>People whose curiosity interlocks with yours</p>
        </div>
        <div className="space-y-4 mb-7">
          {SEED_PROFILES.map((profile, i) => (
            <div key={i} className="rounded-3xl p-5"
              style={{ background: 'linear-gradient(145deg,#1a1a2e,#141428)', border: '1px solid rgba(255,255,255,0.07)', opacity: phase ? 1 : 0, transform: phase ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ${i * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${profile.color}15`, border: `1px solid ${profile.color}30` }}>
                  {profile.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{profile.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.archetype}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.interests.map((int, j) => (
                  <span key={j} className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}>{int}</span>
                ))}
              </div>
              <p className="text-xs italic mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>"{profile.why}"</p>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: `${profile.color}12`, color: profile.color, border: `1px solid ${profile.color}30` }}>
                Connect — coming soon
              </button>
            </div>
          ))}
        </div>
        <button onClick={onNext}
          className="w-full py-4 rounded-2xl text-black font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 40px rgba(251,191,36,0.25)' }}>
          See My Profile <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
