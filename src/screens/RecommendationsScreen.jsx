import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { REC_SECTIONS } from '../data/fallbackRecs.js'
import { getRecommendations } from '../lib/api.js'
import { Spinner } from '../components/ui/Spinner.jsx'
import { BG, TEXT, text } from '../lib/theme.js'

// ─── RECOMMENDATIONS SCREEN ───────────────────────────────────────────────────

export function RecommendationsScreen({ liked, onNext }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState(0)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    let phaseTimer = null

    const interests = liked.map(c => `${c.label} (${c.category})`).join(', ')
    setLoading(true)
    getRecommendations(interests).then(({ data: recs, usingFallback: fallback }) => {
      if (cancelled) return
      setData(recs)
      setUsingFallback(fallback)
      setLoading(false)
      phaseTimer = setTimeout(() => setPhase(1), 150)
    })

    return () => { cancelled = true; if (phaseTimer) clearTimeout(phaseTimer) }
  }, [liked])

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: BG }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: TEXT }}>
            Your Expansion Map
          </h1>
          <p className="text-sm" style={{ color: text(0.35) }}>
            {usingFallback ? 'Curated for your interests' : 'AI-curated for your profile'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <Spinner size={56} double />
            <p className="text-sm" style={{ color: text(0.4) }}>Reading your cosmic profile…</p>
          </div>
        ) : (
          <div style={{ opacity: phase ? 1 : 0, transform: phase ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
            {REC_SECTIONS.map((section, si) => (
              <div key={section.key} className="mb-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: `${section.color}30` }} />
                  <div className="text-center">
                    <span className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif', color: section.color, letterSpacing: '-0.02em' }}>{section.title}</span>
                    <p className="text-xs" style={{ color: text(0.3) }}>{section.subtitle}</p>
                  </div>
                  <div className="h-px flex-1" style={{ background: `${section.color}30` }} />
                </div>
                <div className="space-y-2.5">
                  {data?.[section.key]?.map((item, i) => (
                    <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
                      style={{ background: `${section.color}09`, border: `1px solid ${section.color}20`, opacity: phase ? 1 : 0, transform: phase ? 'none' : 'translateY(8px)', transition: `opacity 0.5s ${(si * 3 + i) * 60}ms, transform 0.5s ${(si * 3 + i) * 60}ms` }}>
                      <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm leading-tight" style={{ color: TEXT }}>{item.title}</p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: text(0.45) }}>{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => onNext(data)}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', boxShadow: '0 0 40px rgba(139,92,246,0.25)' }}>
              Meet Your Matches <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
