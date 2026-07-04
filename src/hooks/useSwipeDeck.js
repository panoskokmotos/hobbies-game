import { useState, useRef, useCallback, useEffect } from 'react'

// Shared pointer-drag / exit-animation / keyboard-shortcut mechanics for a
// Tinder-style card stack. Consolidates what used to be two independent
// implementations in SwipeScreen and DiscoverScreen.
//
// `onDecide(direction)` fires immediately when a swipe starts (for sound,
// haptics, dismissing a tutorial hint, etc). `onDecideComplete(direction)`
// fires after the exit animation finishes (for the actual state mutation —
// advancing the deck, recording the swipe, etc), matching the two-phase
// timing both original implementations relied on.
export function useSwipeDeck({ onDecide, onDecideComplete, canDecide = true, exitDurationMs = 380 }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting] = useState(null)
  const isDeciding = useRef(false)
  const dragStart = useRef(null)

  const decide = useCallback((direction) => {
    if (isDeciding.current || !canDecide) return
    isDeciding.current = true
    setExiting(direction)
    setDragging(false)
    onDecide?.(direction)

    setTimeout(() => {
      setOffset({ x: 0, y: 0 })
      setExiting(null)
      isDeciding.current = false
      dragStart.current = null
      onDecideComplete?.(direction)
    }, exitDurationMs)
  }, [onDecide, onDecideComplete, canDecide, exitDurationMs])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight') decide('right')
      if (e.key === 'ArrowLeft') decide('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decide])

  const onPointerDown = e => {
    if (isDeciding.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
  }
  const onPointerMove = e => {
    if (!dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }
  const onPointerUp = () => {
    if (!dragStart.current) return
    if (offset.x > 80) decide('right')
    else if (offset.x < -80) decide('left')
    else { setOffset({ x: 0, y: 0 }); setDragging(false) }
    dragStart.current = null
  }

  return { offset, setOffset, dragging, exiting, decide, onPointerDown, onPointerMove, onPointerUp }
}
