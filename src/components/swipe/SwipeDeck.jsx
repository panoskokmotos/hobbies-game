// Shared card-stack shell: background cards, drag transform/glow, and the
// LOVE IT/NOT ME (or CONNECT/PASS) corner stamps. Consolidates the visual
// mechanics that used to be duplicated between SwipeScreen and DiscoverScreen;
// each screen supplies its own card content via `children`/`nextCard`.
export function SwipeDeck({
  width = 320, height = 460,
  offset, dragging, exiting,
  onPointerDown, onPointerMove, onPointerUp,
  hasNext = false, hasThird = false,
  yDamp = 0.25, exitTransition = 'transform 0.38s cubic-bezier(0.55,0,1,0.45)',
  rightLabel = 'LOVE IT', leftLabel = 'NOT ME',
  enableUp = false, upLabel = 'SUPER LIKE',
  children,
}) {
  const rotation = offset.x * 0.1
  const swipeDir = enableUp && offset.y < -50 && Math.abs(offset.y) > Math.abs(offset.x)
    ? 'up'
    : offset.x > 50 ? 'right' : offset.x < -50 ? 'left' : null
  // Suppress the horizontal stamps while a drag is dominantly vertical (up),
  // so the up-swipe stamp doesn't overlap with LOVE IT/NOT ME.
  const rightOpacity = swipeDir === 'up' ? 0 : Math.min(1, Math.max(0, offset.x / 90))
  const leftOpacity = swipeDir === 'up' ? 0 : Math.min(1, Math.max(0, -offset.x / 90))
  const upOpacity = swipeDir === 'up' ? Math.min(1, Math.max(0, -offset.y / 90)) : 0

  let cardTransform = `translateX(${offset.x}px) translateY(${offset.y * yDamp}px) rotate(${rotation}deg)`
  let cardTransition = dragging ? 'none' : 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
  if (exiting === 'right') { cardTransform = 'translateX(150vw) rotate(30deg)'; cardTransition = exitTransition }
  if (exiting === 'left')  { cardTransform = 'translateX(-150vw) rotate(-30deg)'; cardTransition = exitTransition }
  if (exiting === 'up')    { cardTransform = 'translateY(-150vh) scale(0.92)'; cardTransition = exitTransition }

  const glowColor = swipeDir === 'right'
    ? '0 0 70px rgba(253,41,123,0.45), 0 30px 80px rgba(0,0,0,0.6)'
    : swipeDir === 'left'
    ? '0 0 70px rgba(59,130,246,0.45), 0 30px 80px rgba(0,0,0,0.6)'
    : swipeDir === 'up'
    ? '0 0 70px rgba(34,211,238,0.5), 0 30px 80px rgba(0,0,0,0.6)'
    : '0 30px 80px rgba(0,0,0,0.6)'

  return (
    <div className="relative" style={{ width, height }}>
      {hasThird && (
        <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(145deg,#141428,#0e1020)', transform: 'scale(0.86) translateY(28px)', border: '1px solid rgba(255,255,255,0.04)' }} />
      )}
      {hasNext && (
        <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(145deg,#181830,#141428)', transform: 'scale(0.93) translateY(16px)', border: '1px solid rgba(255,255,255,0.05)' }} />
      )}
      <div
        className="absolute inset-0 rounded-3xl flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#1c1c34,#161628)', border: '1px solid rgba(255,255,255,0.1)', transform: cardTransform, transition: cardTransition, boxShadow: glowColor, touchAction: 'none' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      >
        <div className="absolute top-8 left-7 pointer-events-none z-10" style={{ opacity: rightOpacity, transform: 'rotate(-14deg)' }}>
          <div className="px-4 py-1.5 rounded-xl" style={{ border: '2.5px solid #fd297b', background: 'rgba(253,41,123,0.12)' }}>
            <span className="font-black text-lg tracking-widest" style={{ color: '#fd297b' }}>{rightLabel}</span>
          </div>
        </div>
        <div className="absolute top-8 right-7 pointer-events-none z-10" style={{ opacity: leftOpacity, transform: 'rotate(14deg)' }}>
          <div className="px-4 py-1.5 rounded-xl" style={{ border: '2.5px solid #60a5fa', background: 'rgba(96,165,250,0.12)' }}>
            <span className="font-black text-lg tracking-widest" style={{ color: '#60a5fa' }}>{leftLabel}</span>
          </div>
        </div>
        {enableUp && (
          <div className="absolute top-8 left-1/2 pointer-events-none z-10" style={{ opacity: upOpacity, transform: 'translateX(-50%)' }}>
            <div className="px-4 py-1.5 rounded-xl" style={{ border: '2.5px solid #22d3ee', background: 'rgba(34,211,238,0.12)' }}>
              <span className="font-black text-lg tracking-widest" style={{ color: '#22d3ee' }}>{upLabel}</span>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
