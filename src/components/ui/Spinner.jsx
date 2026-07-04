// ─── SPINNER ──────────────────────────────────────────────────────────────────
// Shared loading indicator replacing the half-dozen hand-rolled spinner divs
// that used to be scattered across DiscoverScreen, RecommendationsScreen,
// MyMatchesScreen, and the social auth buttons.

export function Spinner({ size = 48, color = '#fbbf24', thickness = 2, double = false }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full animate-spin"
        style={{ border: `${thickness}px solid ${color}`, borderTopColor: 'transparent' }} />
      {double && (
        <div className="absolute rounded-full"
          style={{
            inset: thickness + 2,
            border: `${thickness - 0.5}px solid ${color}`,
            borderBottomColor: 'transparent',
            animation: 'spin 1.5s linear infinite reverse',
          }} />
      )}
    </div>
  )
}
