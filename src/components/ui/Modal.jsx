// ─── MODAL ────────────────────────────────────────────────────────────────────
// Shared fixed-inset shell for the two full-screen overlay patterns in the app:
// a centered fade/scale dialog (MatchModal) and a bottom slide-up sheet
// (ChatScreen). `phase` (0 or 1) drives the enter transition and is owned by
// the caller's own effect, since each screen still needs its own cleanup.

export function Modal({ variant = 'center', phase, glow = false, children }) {
  if (variant === 'sheet') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col"
        style={{ background: '#0a0a0f', transform: phase ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        {children}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(10,10,15,0.95)' }}>
      {glow && (
        <div className="absolute inset-0 pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
      )}
      <div className="w-full max-w-xs text-center relative z-10"
        style={{ opacity: phase ? 1 : 0, transform: phase ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {children}
      </div>
    </div>
  )
}
