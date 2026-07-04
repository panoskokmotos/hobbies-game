// ─── LIGHT THEME TOKENS ────────────────────────────────────────────────────────
// Centralizes the base background/text colors that used to be independently
// hardcoded (as `#0a0a0f` / `rgba(255,255,255,X)`) across every screen and
// component, so a future palette change is a one-file edit instead of a
// repo-wide hunt.

export const BG = '#faf9fb'
export const BG_TRANSLUCENT = 'rgba(250,249,251,0.92)'

const TEXT_RGB = '20,18,28'
export const TEXT = `rgb(${TEXT_RGB})`
export const text = (opacity) => `rgba(${TEXT_RGB},${opacity})`
