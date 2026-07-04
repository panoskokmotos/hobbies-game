import { useState, useEffect, useMemo } from 'react'
import { X, Heart, Undo2, Star } from 'lucide-react'
import { CARDS } from '../data/cards.js'
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/categories.js'
import { ALL_ARCHETYPES } from '../data/archetypes.js'
import { whyWeMatch } from '../lib/helpers.js'
import {
  getDiscoveryProfiles, getAdmirers,
  recordSwipe, createMatchIfMutual, undoSwipe, updateProfile, compatibilityScore,
} from '../lib/api.js'
import { useSwipeSound } from '../hooks/useSwipeSound.js'
import { useSwipeDeck } from '../hooks/useSwipeDeck.js'
import { SwipeDeck } from '../components/swipe/SwipeDeck.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'

// ─── DISCOVER SCREEN ──────────────────────────────────────────────────────────

export function DiscoverScreen({ user, myProfile, onMatch, onViewLikes }) {
  const [profiles, setProfiles] = useState([])
  const [swipedIds, setSwipedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [admirerCount, setAdmirerCount] = useState(0)
  const [lastDecision, setLastDecision] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [minCompat, setMinCompat] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(new Set())
  // Hoisted unconditionally — this used to be declared inside the
  // profiles.length===0 early-return branch, which is a Rules-of-Hooks
  // violation (hook count changed across renders as that condition flipped).
  const todayKey = new Date().toDateString()
  const dailyDoneKey = `polymath_daily_${todayKey}`
  const [dailyAdded, setDailyAdded] = useState(() => !!localStorage.getItem(dailyDoneKey))

  const playSwipe = useSwipeSound()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getDiscoveryProfiles(user.id),
      getAdmirers(user.id),
    ]).then(([{ data: profileData }, { data: admirerIds }]) => {
      if (cancelled) return
      setProfiles(profileData || [])
      setAdmirerCount((admirerIds || []).length)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user.id])

  const filteredProfiles = useMemo(() => profiles.filter(p => {
    if (swipedIds.has(p.user_id)) return false
    if (minCompat > 0) {
      const c = compatibilityScore(myProfile?.category_scores, p.category_scores)
      if (c < minCompat) return false
    }
    if (categoryFilter.size > 0) {
      const pCats = new Set(Object.entries(p.category_scores || {}).filter(([,v]) => v > 0).map(([k]) => k))
      if (![...categoryFilter].some(cat => pCats.has(cat))) return false
    }
    return true
  }), [profiles, swipedIds, minCompat, categoryFilter, myProfile])

  const currentProfile = filteredProfiles[0]

  const { offset, dragging, exiting, decide, onPointerDown, onPointerMove, onPointerUp } = useSwipeDeck({
    canDecide: filteredProfiles.length > 0,
    enableUp: true,
    onDecide: (direction) => {
      playSwipe(direction)
      if (navigator.vibrate) navigator.vibrate(direction === 'up' ? [15, 30, 15] : direction === 'right' ? [20] : [10])
    },
    onDecideComplete: async (direction) => {
      const profile = currentProfile
      if (!profile) return
      const swipeDirection = direction === 'right' ? 'like' : direction === 'up' ? 'superlike' : 'pass'
      await recordSwipe(user.id, profile.user_id, swipeDirection)
      let matched = false
      if (direction === 'right' || direction === 'up') {
        const result = await createMatchIfMutual(user.id, profile.user_id)
        matched = result.matched
        if (matched) onMatch?.(profile)
      }
      setSwipedIds(prev => new Set([...prev, profile.user_id]))
      // Rewind is only offered for swipes that didn't just create a match —
      // once the match celebration has fired, undoing it would be confusing
      // (mirrors real Tinder's rewind limitations).
      setLastDecision(matched ? null : { profile, direction })
    },
  })

  const handleUndo = async () => {
    if (!lastDecision) return
    const { profile } = lastDecision
    setLastDecision(null)
    await undoSwipe(user.id, profile.user_id)
    setSwipedIds(prev => {
      const next = new Set(prev)
      next.delete(profile.user_id)
      return next
    })
  }

  const toggleCategory = (cat) => {
    setCategoryFilter(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f', paddingBottom: 80 }}>
        <Spinner size={48} />
      </div>
    )
  }

  if (profiles.length === 0 || filteredProfiles.length === 0) {
    const isEmpty = profiles.length === 0
    const inviteText = `I just found out I'm The ${user?.email?.split('@')[0] || 'Explorer'} on Polymath — what are you? 60-second test → ${window.location.origin}`
    const handleInvite = () => {
      if (navigator.share) {
        navigator.share({ title: 'Join me on Polymath', text: inviteText, url: window.location.origin }).catch(() => {})
      } else {
        navigator.clipboard.writeText(window.location.origin).catch(() => {})
      }
    }

    const myLikedIdsEmpty = new Set(myProfile?.liked_card_ids || [])
    const unlikedCards = CARDS.filter(c => !myLikedIdsEmpty.has(c.id))
    const seedNum = [...todayKey].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const todayCard = unlikedCards.length > 0 ? unlikedCards[seedNum % unlikedCards.length] : null

    const handleAddDailyCard = async () => {
      if (!todayCard || dailyAdded) return
      const newIds = [...(myProfile?.liked_card_ids || []), todayCard.id]
      await updateProfile(user.id, { liked_card_ids: newIds })
      localStorage.setItem(dailyDoneKey, '1')
      setDailyAdded(true)
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#0a0a0f', paddingBottom: 80 }}>
        <div className="text-5xl mb-4">🌌</div>
        <h2 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
          {isEmpty ? "You're one of the first here." : filteredProfiles.length === 0 && profiles.length > 0 ? "No profiles match your filters." : "You've seen everyone."}
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 260 }}>
          {isEmpty
            ? "The people who join now will define this community."
            : filteredProfiles.length === 0 && profiles.length > 0
            ? "Try adjusting your filters to see more people."
            : "Invite friends — new matches appear when they join."}
        </p>
        {filteredProfiles.length === 0 && profiles.length > 0 ? (
          <button onClick={() => { setMinCompat(0); setCategoryFilter(new Set()) }}
            className="px-6 py-3 rounded-2xl font-bold text-sm mb-8 transition-all hover:scale-[1.03]"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
            Clear filters
          </button>
        ) : (
          <button
            onClick={handleInvite}
            className="px-6 py-3 rounded-2xl font-bold text-sm mb-8 transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}>
            {isEmpty ? '✨ Invite friends & unlock matches' : '🔗 Invite more people'}
          </button>
        )}

        {todayCard && (
          <div className="w-full max-w-xs">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Today's discovery</p>
            <div className="rounded-2xl p-5 text-center mb-3"
              style={{ background: `${CATEGORY_COLORS[todayCard.category]}0d`, border: `1px solid ${CATEGORY_COLORS[todayCard.category]}30` }}>
              <div className="text-4xl mb-2">{todayCard.emoji}</div>
              <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif' }}>{todayCard.label}</p>
              <p className="text-xs mb-3" style={{ color: CATEGORY_COLORS[todayCard.category] }}>{CATEGORY_LABELS[todayCard.category]}</p>
              <button
                onClick={handleAddDailyCard}
                disabled={dailyAdded}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: dailyAdded ? 'rgba(16,185,129,0.12)' : `${CATEGORY_COLORS[todayCard.category]}20`,
                  color: dailyAdded ? '#10b981' : CATEGORY_COLORS[todayCard.category],
                  border: `1px solid ${dailyAdded ? 'rgba(16,185,129,0.35)' : `${CATEGORY_COLORS[todayCard.category]}40`}`,
                }}>
                {dailyAdded ? '✓ Added to your profile' : '+ Add to my profile'}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Come back tomorrow for a new one.</p>
          </div>
        )}
      </div>
    )
  }

  const profile = currentProfile
  const scores = profile.category_scores || {}
  const compat = compatibilityScore(myProfile?.category_scores, scores)
  const whyPhrase = whyWeMatch(myProfile?.category_scores, scores)
  const archName = ALL_ARCHETYPES.find(a => a.id === profile.archetype_id)
  const likedCards = (profile.liked_card_ids || []).map(id => CARDS.find(c => c.id === id)).filter(Boolean)
  const top5 = likedCards.slice(0, 5)
  const myLikedIds = new Set(myProfile?.liked_card_ids || [])
  const sharedCards = likedCards.filter(c => myLikedIds.has(c.id)).slice(0, 3)
  const activeFilterCount = (minCompat > 0 ? 1 : 0) + categoryFilter.size

  return (
    <div className="min-h-screen flex flex-col items-center justify-center select-none"
      style={{ background: '#0a0a0f', paddingBottom: 96 }}>
      <div className="w-full max-w-xs px-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>discover</span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{filteredProfiles.length} left</span>
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: showFilters || activeFilterCount > 0 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)',
                color: showFilters || activeFilterCount > 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                border: showFilters || activeFilterCount > 0 ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}>
              ⚙ {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}` : 'Filter'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-2 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Min compatibility</span>
                <span className="text-xs font-bold" style={{ color: minCompat > 0 ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>{minCompat > 0 ? `${minCompat}%+` : 'Any'}</span>
              </div>
              <input type="range" min={0} max={80} step={10} value={minCompat} onChange={e => setMinCompat(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#fbbf24', background: `linear-gradient(to right, #fbbf24 ${minCompat / 80 * 100}%, rgba(255,255,255,0.1) 0%)` }} />
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Shared interests in</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: categoryFilter.has(cat) ? `${CATEGORY_COLORS[cat]}22` : 'rgba(255,255,255,0.04)',
                      color: categoryFilter.has(cat) ? CATEGORY_COLORS[cat] : 'rgba(255,255,255,0.35)',
                      border: categoryFilter.has(cat) ? `1px solid ${CATEGORY_COLORS[cat]}55` : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => { setMinCompat(0); setCategoryFilter(new Set()) }}
                className="mt-2 w-full py-1.5 text-xs rounded-lg transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Clear all
              </button>
            )}
          </div>
        )}

        {admirerCount > 0 && (
          <button onClick={onViewLikes}
            className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-opacity hover:opacity-85"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.2)' }}>
              💜
            </div>
            <p className="text-xs leading-tight flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>{admirerCount} {admirerCount === 1 ? 'person' : 'people'}</span> already {admirerCount === 1 ? 'likes' : 'like'} you — see who →
            </p>
          </button>
        )}
      </div>

      <SwipeDeck
        width={320} height={480}
        offset={offset} dragging={dragging} exiting={exiting}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        hasNext={!!filteredProfiles[1]}
        yDamp={0.2} exitTransition="transform 0.38s ease-in"
        rightLabel="CONNECT" leftLabel="PASS"
        enableUp upLabel="SUPER LIKE"
      >
        <div className="flex flex-col items-center justify-center flex-1 px-6 pt-8 pb-2">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {profile.avatar_emoji || archName?.emoji || '👤'}
          </div>

          <p className="text-white font-bold text-xl mb-1 text-center" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
            {profile.display_name || 'Anonymous'}
          </p>
          <span className="px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
            {archName?.name || 'Explorer'}
          </span>

          {profile.bio && (
            <p className="text-xs text-center mb-3 px-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
              "{profile.bio}"
            </p>
          )}

          {top5.length > 0 && (
            <div className="flex gap-1.5 mb-3 flex-wrap justify-center">
              {top5.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: `${CATEGORY_COLORS[c.category]}12`, color: CATEGORY_COLORS[c.category], border: `1px solid ${CATEGORY_COLORS[c.category]}28` }}>
                  {c.emoji} {c.label}
                </span>
              ))}
            </div>
          )}

          {sharedCards.length > 0 && (
            <div className="mb-2 w-full">
              <p className="text-center text-xs mb-1.5 font-medium" style={{ color: 'rgba(251,191,36,0.55)' }}>you both love</p>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {sharedCards.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(251,191,36,0.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.38)' }}>
                    {c.emoji} {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {compat > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-1"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <span className="text-xs font-bold" style={{ color: '#8b5cf6' }}>{compat}% compatible</span>
            </div>
          )}
          {whyPhrase && (
            <p className="text-xs text-center px-3" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>"{whyPhrase}"</p>
          )}
        </div>

        <p className="text-center pb-3 text-xs pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
          ← drag or arrow keys → · ↑ super like
        </p>
      </SwipeDeck>

      <div className="flex items-center gap-4 mt-8">
        <button onClick={handleUndo} disabled={!lastDecision}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-25 disabled:hover:scale-100"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
          <Undo2 size={18} color="rgba(255,255,255,0.6)" />
        </button>
        <button onClick={() => decide('left')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1.5px solid rgba(96,165,250,0.35)' }}>
          <X size={26} color="#60a5fa" />
        </button>
        <button onClick={() => decide('up')}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(34,211,238,0.12)', border: '1.5px solid rgba(34,211,238,0.35)' }}>
          <Star size={18} color="#22d3ee" />
        </button>
        <button onClick={() => decide('right')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1.5px solid rgba(251,191,36,0.35)' }}>
          <Heart size={26} color="#fbbf24" />
        </button>
      </div>
    </div>
  )
}
