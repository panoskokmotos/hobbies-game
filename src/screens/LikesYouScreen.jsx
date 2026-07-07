import { useState, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { CARDS } from '../data/cards.js'
import { CATEGORY_COLORS } from '../data/categories.js'
import { ALL_ARCHETYPES } from '../data/archetypes.js'
import { getAdmirerProfiles, recordSwipe, createMatchIfMutual, compatibilityScore } from '../lib/api.js'
import { Spinner } from '../components/ui/Spinner.jsx'
import { BG, TEXT, text } from '../lib/theme.js'

// ─── LIKES YOU SCREEN ─────────────────────────────────────────────────────────
// Tinder Gold's core hook, minus the paywall (this app has no premium tier, so
// gatekeeping admirers behind a blur would just be friction with no upside).
// Liking someone here is guaranteed mutual — they already liked us.

export function LikesYouScreen({ user, myProfile, onMatch }) {
  const [admirers, setAdmirers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState(null) // user_id currently being actioned

  useEffect(() => {
    let cancelled = false
    getAdmirerProfiles(user.id).then(({ data }) => {
      if (cancelled) return
      setAdmirers(data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user.id])

  const handleDecide = async (profile, direction) => {
    if (deciding) return
    setDeciding(profile.user_id)
    await recordSwipe(user.id, profile.user_id, direction === 'right' ? 'like' : 'pass')
    if (direction === 'right') {
      const { matched } = await createMatchIfMutual(user.id, profile.user_id)
      if (matched) onMatch?.(profile)
    }
    setAdmirers(prev => prev.filter(p => p.user_id !== profile.user_id))
    setDeciding(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG, paddingBottom: 80 }}>
        <Spinner size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: BG, paddingBottom: 100 }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💜</div>
          <h1 className="mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: TEXT }}>
            Likes You
          </h1>
          <p className="text-sm" style={{ color: text(0.35) }}>
            {admirers.length === 0 ? 'No one yet — keep exploring' : `${admirers.length} ${admirers.length === 1 ? 'person likes' : 'people like'} you`}
          </p>
        </div>

        {admirers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌌</div>
            <p className="text-sm" style={{ color: text(0.3) }}>
              Your admirers will show up here.<br />Head to Discover to be seen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {admirers.map(profile => {
              const archName = ALL_ARCHETYPES.find(a => a.id === profile.archetype_id)
              const likedCards = (profile.liked_card_ids || []).map(id => CARDS.find(c => c.id === id)).filter(Boolean)
              const top2 = likedCards.slice(0, 2)
              const compat = compatibilityScore(myProfile?.category_scores, profile.category_scores)
              const isDeciding = deciding === profile.user_id

              return (
                <div key={profile.user_id} className="rounded-2xl p-3.5 flex flex-col items-center text-center"
                  style={{ background: 'linear-gradient(145deg,rgba(253,41,123,0.07),rgba(253,41,123,0.03))', border: '1px solid rgba(253,41,123,0.2)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2"
                    style={{ background: 'rgba(253,41,123,0.12)', border: '1px solid rgba(253,41,123,0.3)' }}>
                    {profile.avatar_emoji || archName?.emoji || '👤'}
                  </div>
                  <p className="font-semibold text-sm truncate w-full" style={{ color: TEXT }}>{profile.display_name || 'Anonymous'}</p>
                  <p className="text-xs mb-1.5 truncate w-full" style={{ color: text(0.4) }}>{archName?.name || 'Explorer'}</p>
                  {compat > 0 && (
                    <p className="text-xs font-bold mb-1.5" style={{ color: '#fd297b' }}>{compat}% compatible</p>
                  )}
                  {top2.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-center mb-3">
                      {top2.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: `${CATEGORY_COLORS[c.category]}12`, color: CATEGORY_COLORS[c.category], border: `1px solid ${CATEGORY_COLORS[c.category]}28` }}>
                          {c.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto w-full">
                    <button onClick={() => handleDecide(profile, 'left')} disabled={isDeciding}
                      className="flex-1 py-2 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                      style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
                      <X size={16} color="#60a5fa" />
                    </button>
                    <button onClick={() => handleDecide(profile, 'right')} disabled={isDeciding}
                      className="flex-1 py-2 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                      style={{ background: 'rgba(253,41,123,0.12)', border: '1px solid rgba(253,41,123,0.35)' }}>
                      <Heart size={16} color="#fd297b" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
