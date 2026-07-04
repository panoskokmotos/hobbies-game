import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal.jsx'

// ─── MATCH MODAL ──────────────────────────────────────────────────────────────

export function MatchModal({ myArchetype, myLikedCards, theirProfile, onClose, onDiscover }) {
  const [phase, setPhase] = useState(0)
  const [waved, setWaved] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 100)
    return () => clearTimeout(t)
  }, [])

  const theirLikedIds = new Set(theirProfile?.liked_card_ids || [])
  const sharedCards = (myLikedCards || []).filter(c => theirLikedIds.has(c.id)).slice(0, 3)

  return (
    <Modal variant="center" phase={phase} glow>
      <div className="text-5xl mb-4">💜</div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#8b5cf6' }}>It's a match</p>
      <h1 className="text-white text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em' }}>
        You and {theirProfile?.display_name || 'someone'} clicked
      </h1>

      {sharedCards.length > 0 ? (
        <div className="mb-6">
          <p className="text-xs mb-2 font-medium" style={{ color: 'rgba(251,191,36,0.6)' }}>You both love</p>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {sharedCards.map((c, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(251,191,36,0.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.38)' }}>
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Two curious minds found each other. Start a conversation.
        </p>
      )}

      <div className="flex justify-center gap-6 mb-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'rgba(251,191,36,0.12)', border: '2px solid rgba(251,191,36,0.3)' }}>
            {myArchetype?.emoji}
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>You</span>
        </div>
        <div className="self-center text-2xl">✦</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'rgba(139,92,246,0.12)', border: '2px solid rgba(139,92,246,0.3)' }}>
            {theirProfile?.avatar_emoji || '👤'}
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{theirProfile?.display_name || 'Them'}</span>
        </div>
      </div>

      <button
        onClick={() => setWaved(true)}
        className="w-full py-3.5 rounded-2xl font-bold mb-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: waved ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.15)', color: waved ? '#fbbf24' : '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }}>
        {waved ? '👋 Wave sent!' : 'Send a Wave 👋'}
      </button>
      <button onClick={onDiscover}
        className="w-full py-3.5 rounded-2xl text-white font-bold mb-3 transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
        See My Matches
      </button>
      <button onClick={onClose}
        className="w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        Keep discovering
      </button>
    </Modal>
  )
}
