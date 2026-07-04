import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/categories.js'
import { computeScores } from '../lib/helpers.js'
import { RadarChart } from '../components/RadarChart.jsx'

// ─── ARCHETYPE SCREEN ─────────────────────────────────────────────────────────

export function ArchetypeScreen({ archetype, liked, onNext }) {
  const [phase, setPhase] = useState(0)
  const scores = computeScores(liked)
  const topCats = CATEGORIES.filter(c => scores[c] > 0).sort((a, b) => scores[b] - scores[a])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500)
    const t2 = setTimeout(() => setPhase(2), 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}>
      <div className="absolute inset-0 pointer-events-none animate-glow-pulse"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(251,191,36,0.14) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.25) 0%, transparent 55%)', opacity: phase === 0 ? 1 : 0 }} />

      <div className="w-full max-w-sm relative z-10"
        style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="flex justify-center mb-5">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em]"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            {archetype.rarityLabel} · {archetype.rarity}% of users
          </span>
        </div>
        <div className="text-center text-7xl mb-5 animate-float">{archetype.emoji}</div>
        <h1 className="text-center text-white mb-4 leading-tight"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em' }}>
          {archetype.name}
        </h1>
        <p className="text-center text-xs mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {Math.round(21000 * archetype.rarity / 100)} Polymaths worldwide share this archetype
        </p>
        <p className="text-center text-lg leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>{archetype.description}</p>
        <p className="text-center text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>{archetype.description2}</p>

        <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'scale(1)' : 'scale(0.8)', transition: 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="rounded-3xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <RadarChart scores={scores} size={280} animate />
          </div>
          {topCats.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {topCats.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: `${CATEGORY_COLORS[cat]}15`, color: CATEGORY_COLORS[cat], border: `1px solid ${CATEGORY_COLORS[cat]}30` }}>
                  {CATEGORY_LABELS[cat]} <span style={{ opacity: 0.6 }}>×{scores[cat]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onNext}
          className="w-full py-4 rounded-2xl text-black font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 40px rgba(251,191,36,0.3)' }}>
          See What's Next For Me <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
