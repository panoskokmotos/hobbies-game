import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { CATEGORY_COLORS } from '../data/categories.js'
import { computeScores, whyWeMatch, getShareUrl } from '../lib/helpers.js'
import { compatibilityScore } from '../lib/api.js'
import { TEXT, text } from '../lib/theme.js'

// ─── COMPARISON VIEW ──────────────────────────────────────────────────────────
// The two-sided half of the share loop: given the viewer's own profile (`mine`)
// and a friend's decoded shared profile (`theirs`), shows a side-by-side
// archetype comparison + compatibility %, then nudges the viewer to share their
// OWN link so the loop continues. Reused both on the share landing (full screen)
// and in a modal from the archetype reveal.
//
// `mine`  = { archetype, liked }        (liked = card objects)
// `theirs`= { archetype, likedCards }   (likedCards = card objects)

export function ComparisonView({ mine, theirs, onContinue, continueLabel = 'Continue →' }) {
  const [copied, setCopied] = useState(false)

  const myScores = computeScores(mine.liked)
  const theirScores = computeScores(theirs.likedCards)
  const compat = compatibilityScore(myScores, theirScores)
  const why = whyWeMatch(myScores, theirScores)

  const theirIds = new Set(theirs.likedCards.map(c => c.id))
  const shared = mine.liked.filter(c => theirIds.has(c.id)).slice(0, 6)

  const handleShare = async () => {
    const url = getShareUrl(mine.archetype, mine.liked)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I'm ${mine.archetype.name} on Polymath`,
          text: `We're ${compat}% aligned. Find out how you compare →`,
          url,
        })
        return
      } catch {}
    }
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#fd297b' }}>
        You two compared
      </p>

      {/* Side-by-side archetypes with the score between them */}
      <div className="flex items-stretch justify-center gap-3 mb-5">
        <Side emoji={mine.archetype.emoji} name={mine.archetype.name} label="You" tint="#fd297b" />
        <div className="flex flex-col items-center justify-center px-1">
          <span className="leading-none" style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 34, color: TEXT }}>
            {compat}%
          </span>
          <span className="text-xs font-semibold" style={{ color: '#fd297b' }}>aligned</span>
        </div>
        <Side emoji={theirs.archetype.emoji} name={theirs.archetype.name} label="Them" tint="#ff655b" />
      </div>

      {why && (
        <p className="text-sm leading-relaxed mb-4 px-2" style={{ color: text(0.5), fontStyle: 'italic' }}>
          "{why}"
        </p>
      )}

      {shared.length > 0 ? (
        <div className="mb-6">
          <p className="text-xs font-medium mb-2" style={{ color: text(0.4) }}>You both love</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {shared.map(c => (
              <span key={c.id} className="px-3 py-1.5 rounded-full text-sm"
                style={{ background: `${CATEGORY_COLORS[c.category]}12`, color: CATEGORY_COLORS[c.category], border: `1px solid ${CATEGORY_COLORS[c.category]}28` }}>
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm mb-6" style={{ color: text(0.4) }}>
          Opposites attract — you two barely overlap.
        </p>
      )}

      <button onClick={handleShare}
        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mb-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: copied ? 'rgba(16,185,129,0.15)' : text(0.06),
          border: copied ? '1px solid rgba(16,185,129,0.4)' : `1px solid ${text(0.15)}`,
          color: copied ? '#10b981' : TEXT,
        }}>
        {copied ? <Check size={16} /> : <Share2 size={16} />}
        {copied ? 'Link copied!' : 'Share yours to compare with friends'}
      </button>

      {onContinue && (
        <button onClick={onContinue}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)', boxShadow: '0 0 40px rgba(253,41,123,0.25)' }}>
          {continueLabel}
        </button>
      )}
    </div>
  )
}

function Side({ emoji, name, label, tint }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
        style={{ background: `${tint}1f`, border: `2px solid ${tint}55` }}>
        {emoji}
      </div>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: tint }}>{label}</span>
      <span className="text-xs font-semibold leading-tight" style={{ color: text(0.6) }}>{name}</span>
    </div>
  )
}
