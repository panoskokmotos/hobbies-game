import { useState } from 'react'
import { User, Compass, Heart, MessageCircle, Lock } from 'lucide-react'
import { BG_TRANSLUCENT, text } from '../lib/theme.js'

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
// Rendered globally from the very first screen (not just once signed in), so
// the app has real app chrome immediately instead of feeling like a bare
// quiz. Tabs that aren't reachable yet (before signup) render locked —
// visible for continuity/orientation, but inert — rather than disappearing.

export function BottomNav({ tab, onTab, matchCount = 0, admirerCount = 0, lockedTabs = [] }) {
  const [shakingId, setShakingId] = useState(null)
  const tabs = [
    { id: 'profile',  label: 'Profile', icon: User },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'likes',    label: 'Likes',   icon: Heart, badge: admirerCount },
    { id: 'matches',  label: 'Chats',   icon: MessageCircle, badge: matchCount },
  ]
  const handleClick = (id, locked) => {
    if (locked) {
      // Silent no-ops read as "broken" — a quick shake tells the user this
      // tab is intentionally unavailable (sign up first), not unresponsive.
      setShakingId(id)
      setTimeout(() => setShakingId(null), 400)
    } else {
      onTab(id)
    }
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: BG_TRANSLUCENT, borderTop: `1px solid ${text(0.08)}`, backdropFilter: 'blur(16px)' }}>
      <div className="flex max-w-sm mx-auto">
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const active = tab === id
          const locked = lockedTabs.includes(id)
          return (
            <button key={id} onClick={() => handleClick(id, locked)}
              className="relative flex-1 py-3 flex flex-col items-center gap-1 transition-all duration-150"
              style={{
                color: active ? '#fd297b' : locked ? text(0.2) : text(0.4),
                cursor: locked ? 'default' : 'pointer',
                animation: shakingId === id ? 'shake 0.4s ease-in-out' : 'none',
              }}>
              {shakingId === id && (
                <span className="absolute px-2 py-1 rounded-lg whitespace-nowrap"
                  style={{ top: -30, background: BG_TRANSLUCENT, border: `1px solid ${text(0.1)}`, color: text(0.6), fontSize: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  Sign up to unlock
                </span>
              )}
              <div className="relative">
                {locked ? <Lock size={16} /> : <Icon size={20} />}
                {!locked && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: '#8b5cf6', color: 'white', fontSize: 9 }}>{badge}</span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
