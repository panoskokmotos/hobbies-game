import { User, Compass, MessageCircle } from 'lucide-react'

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

export function BottomNav({ tab, onTab, matchCount = 0 }) {
  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: User },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'matches',  label: 'Matches',  icon: MessageCircle, badge: matchCount },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(10,10,15,0.95)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
      <div className="flex max-w-sm mx-auto">
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => onTab(id)}
              className="flex-1 py-3 flex flex-col items-center gap-1 transition-all duration-150"
              style={{ color: active ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
              <div className="relative">
                <Icon size={20} />
                {badge > 0 && (
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
