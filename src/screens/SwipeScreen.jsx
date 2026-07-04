import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, X, Undo2 } from 'lucide-react'
import { CARDS } from '../data/cards.js'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/categories.js'
import { useSwipeSound } from '../hooks/useSwipeSound.js'
import { useSwipeDeck } from '../hooks/useSwipeDeck.js'
import { SwipeDeck } from '../components/swipe/SwipeDeck.jsx'
import { BG, TEXT, text } from '../lib/theme.js'

const QUICK_LIMIT = 5

// ─── SWIPE SCREEN ─────────────────────────────────────────────────────────────

export function SwipeScreen({ onComplete, onQuickComplete, startIndex = 0, initialLiked = [] }) {
  const [index, setIndex] = useState(startIndex)
  const [liked, setLiked] = useState(initialLiked)
  const [streakMsg, setStreakMsg] = useState(null)
  const [showTutorial, setShowTutorial] = useState(() => startIndex === 0 && !localStorage.getItem('polymath_swiped'))
  const [canUndo, setCanUndo] = useState(false)

  const indexRef = useRef(startIndex)
  const likedRef = useRef(initialLiked)
  const consecutiveRight = useRef(0)
  // Single-level rewind snapshot (Tinder's free-tier "one rewind," not unlimited) —
  // pure client state here, no backend involved for the onboarding deck.
  const lastDecisionRef = useRef(null)
  const playSwipe = useSwipeSound()

  const handleDecide = useCallback((direction) => {
    localStorage.setItem('polymath_swiped', '1')
    setShowTutorial(false)
    playSwipe(direction)
    if (navigator.vibrate) navigator.vibrate(direction === 'right' ? [30] : [10, 10])
  }, [playSwipe])

  const handleDecideComplete = useCallback((direction) => {
    lastDecisionRef.current = {
      index: indexRef.current,
      liked: likedRef.current,
      consecutiveRight: consecutiveRight.current,
    }
    setCanUndo(true)

    const currentCard = CARDS[indexRef.current]
    const currentLiked = likedRef.current
    const newLiked = direction === 'right' ? [...currentLiked, currentCard] : [...currentLiked]
    const newIndex = indexRef.current + 1

    likedRef.current = newLiked
    indexRef.current = newIndex
    setLiked(newLiked)
    setIndex(newIndex)

    if (direction === 'right') {
      consecutiveRight.current += 1
      const n = consecutiveRight.current
      const totalLikes = newLiked.length
      let msg = null
      if (n === 3) msg = "You're drawn to this. I see it. ✨"
      else if (n === 5) msg = "A collector. I love that. 🔥"
      else if (totalLikes === 10) msg = "10 passions and counting 💫"
      if (msg) {
        setStreakMsg(msg)
        setTimeout(() => setStreakMsg(null), 2200)
      }
    } else {
      consecutiveRight.current = 0
    }

    if (onQuickComplete && newIndex >= QUICK_LIMIT + startIndex) onQuickComplete(newLiked)
    else if (newIndex >= CARDS.length) onComplete(newLiked)
  }, [onComplete, onQuickComplete, startIndex])

  const { offset, setOffset, dragging, exiting, decide, onPointerDown, onPointerMove, onPointerUp } = useSwipeDeck({
    onDecide: handleDecide,
    onDecideComplete: handleDecideComplete,
  })

  const handleUndo = useCallback(() => {
    const snapshot = lastDecisionRef.current
    if (!snapshot) return
    indexRef.current = snapshot.index
    likedRef.current = snapshot.liked
    consecutiveRight.current = snapshot.consecutiveRight
    setIndex(snapshot.index)
    setLiked(snapshot.liked)
    setStreakMsg(null)
    lastDecisionRef.current = null
    setCanUndo(false)
  }, [])

  useEffect(() => {
    if (showTutorial) {
      const t = setTimeout(() => setShowTutorial(false), 3500)
      return () => clearTimeout(t)
    }
  }, [showTutorial])

  useEffect(() => {
    if (showTutorial) return // skip hint nudge if tutorial is showing
    const t = setTimeout(() => {
      setOffset({ x: 20, y: 0 })
      setTimeout(() => setOffset({ x: 0, y: 0 }), 420)
    }, 900)
    return () => clearTimeout(t)
  }, [showTutorial, setOffset])

  if (index >= CARDS.length) return null

  const card = CARDS[index]
  const nextCard = CARDS[index + 1]
  const thirdCard = CARDS[index + 2]
  const total = onQuickComplete ? QUICK_LIMIT : CARDS.length - startIndex
  // Only the "keep swiping past the quick 5" continuation can feel like a
  // wall of cards (up to 45 more) — the quick intro itself is already short
  // and leads straight to signup, so it doesn't need an early-out.
  const canExitEarly = !onQuickComplete && startIndex > 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center select-none"
      style={{ background: BG, paddingBottom: 32 }}>

      <div className="w-full max-w-xs px-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-xl" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em', color: TEXT }}>
            polymath
          </span>
          <span className="text-xs" style={{ color: text(0.3) }}>{index - startIndex}/{total}</span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: text(0.08) }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((index - startIndex) / total) * 100}%`, background: 'linear-gradient(90deg,#ff655b,#fd297b)' }} />
        </div>
        {liked.length > 0 && (
          <p className="text-xs mt-1.5 text-right" style={{ color: 'rgba(253,41,123,0.7)' }}>
            {liked.length} loved ✦
          </p>
        )}
      </div>

      <SwipeDeck
        width={320} height={460}
        offset={offset} dragging={dragging} exiting={exiting}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        hasNext={!!nextCard} hasThird={!!thirdCard}
        yDamp={0.25} exitTransition="transform 0.38s cubic-bezier(0.55,0,1,0.45)"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: `${CATEGORY_COLORS[card.category]}18`, color: CATEGORY_COLORS[card.category], border: `1px solid ${CATEGORY_COLORS[card.category]}35` }}>
              {CATEGORY_LABELS[card.category]}
            </span>
          </div>
          <div className="text-[88px] leading-none mb-5 pointer-events-none">{card.emoji}</div>
          <h2 className="text-3xl font-bold text-center px-6 leading-tight pointer-events-none"
            style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em', color: TEXT }}>
            {card.label}
          </h2>
          <p className="mt-8 text-xs pointer-events-none" style={{ color: text(0.2) }}>
            ← drag · arrow keys →
          </p>
        </div>
      </SwipeDeck>

      {/* First-swipe tutorial */}
      {showTutorial && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-10"
          style={{ top: '30%' }}>
          <div className="flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(96,165,250,0.2)', border: '1.5px solid rgba(96,165,250,0.5)' }}>
              <X size={22} color="#60a5fa" />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(96,165,250,0.8)' }}>pass</span>
          </div>
          <div className="flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(253,41,123,0.2)', border: '1.5px solid rgba(253,41,123,0.5)' }}>
              <Heart size={22} color="#fd297b" />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(253,41,123,0.8)' }}>like</span>
          </div>
        </div>
      )}

      {streakMsg && (
        <div className="mt-6 px-5 py-2.5 rounded-2xl text-sm font-semibold text-center animate-bounce-in"
          style={{ background: 'rgba(253,41,123,0.12)', color: '#fd297b', border: '1px solid rgba(253,41,123,0.25)', maxWidth: 280 }}>
          {streakMsg}
        </div>
      )}

      <div className="flex items-center gap-6 mt-6">
        <button onClick={handleUndo} disabled={!canUndo}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-25 disabled:hover:scale-100"
          style={{ background: text(0.05), border: `1.5px solid ${text(0.15)}` }}>
          <Undo2 size={18} color={text(0.6)} />
        </button>
        <button onClick={() => decide('left')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1.5px solid rgba(96,165,250,0.35)' }}>
          <X size={26} color="#60a5fa" />
        </button>
        <button onClick={() => decide('right')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'rgba(253,41,123,0.12)', border: '1.5px solid rgba(253,41,123,0.35)' }}>
          <Heart size={26} color="#fd297b" />
        </button>
      </div>

      {canExitEarly && (
        <button onClick={() => onComplete(liked)}
          className="mt-5 text-xs transition-opacity hover:opacity-70"
          style={{ color: text(0.3) }}>
          I've seen enough — show my results →
        </button>
      )}
    </div>
  )
}
