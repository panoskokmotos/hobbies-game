import { CARDS } from '../data/cards.js'
import { ALL_ARCHETYPES, DEFAULT_ARCHETYPE } from '../data/archetypes.js'

// ─── PROFILE STATE (anonymous, pre-signup) ────────────────────────────────────

export function saveState(archetype, liked, recommendations) {
  try {
    localStorage.setItem('polymath_v1', JSON.stringify({
      archetypeId: archetype.id,
      likedIds: liked.map(c => c.id),
      recs: recommendations,
    }))
  } catch {}
}

export function loadState() {
  try {
    const raw = localStorage.getItem('polymath_v1')
    if (!raw) return null
    const { archetypeId, likedIds, recs } = JSON.parse(raw)
    const liked = likedIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean)
    const archetype = ALL_ARCHETYPES.find(a => a.id === archetypeId) ?? DEFAULT_ARCHETYPE
    return { archetype, liked, recommendations: recs }
  } catch { return null }
}

// ─── STREAK ────────────────────────────────────────────────────────────────────

export function loadStreak() {
  try {
    const raw = localStorage.getItem('polymath_streak')
    return raw ? JSON.parse(raw) : { count: 0, lastDate: null }
  } catch { return { count: 0, lastDate: null } }
}

export function updateStreak() {
  const today = new Date().toDateString()
  const s = loadStreak()
  if (s.lastDate === today) return s
  const gracePrev = new Date(Date.now() - 26 * 3600 * 1000).toDateString()
  const count = s.lastDate === gracePrev ? s.count + 1 : 1
  const next = { count, lastDate: today }
  try { localStorage.setItem('polymath_streak', JSON.stringify(next)) } catch {}
  return next
}

// ─── PENDING QUICK-ONBOARD (bridges OAuth redirects / email-confirm gaps) ─────
//
// Written right before an auth flow that leaves the page (OAuth redirect) or
// waits on an external step (email confirmation), so swipe data collected
// before signup survives the round trip. Always cleared on read — including
// when the round trip never completes (e.g. the user cancels an OAuth popup)
// — so a stale key can't get picked up and silently overwrite an unrelated
// later sign-in. The TTL is a second line of defense against the same failure.

const QUICK_KEY = 'polymath_quick'
const QUICK_TTL_MS = 10 * 60 * 1000 // 10 minutes — long enough for an OAuth/email round trip

export function setPendingQuickOnboard(likedIds) {
  try {
    localStorage.setItem(QUICK_KEY, JSON.stringify({ likedIds, ts: Date.now() }))
  } catch {}
}

export function consumePendingQuickOnboard() {
  let raw = null
  try { raw = localStorage.getItem(QUICK_KEY) } catch {}
  try { localStorage.removeItem(QUICK_KEY) } catch {}
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Date.now() - (parsed.ts || 0) > QUICK_TTL_MS) return null
    return parsed.likedIds || null
  } catch { return null }
}

export function clearPendingQuickOnboard() {
  try { localStorage.removeItem(QUICK_KEY) } catch {}
}

// Non-consuming check, for callers that need to know whether a recovery is
// pending without claiming it (the actual consumption happens exactly once,
// in the onAuthStateChange handler).
export function hasPendingQuickOnboard() {
  try { return !!localStorage.getItem(QUICK_KEY) } catch { return false }
}

// ─── PENDING FRIEND COMPARE (bridges a share-link open through onboarding) ────
//
// When someone opens a friend's `?p=` share link before they've taken the quiz
// themselves, we stash the friend's encoded payload here and re-surface the
// side-by-side comparison once they finish onboarding and have their own
// archetype. Same clear-on-read + TTL discipline as pending quick-onboard.

const COMPARE_KEY = 'polymath_compare'
const COMPARE_TTL_MS = 30 * 60 * 1000 // 30 minutes — long enough to finish the quiz

export function setPendingCompare(payload) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify({ payload, ts: Date.now() }))
  } catch {}
}

export function consumePendingCompare() {
  let raw = null
  try { raw = localStorage.getItem(COMPARE_KEY) } catch {}
  try { localStorage.removeItem(COMPARE_KEY) } catch {}
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Date.now() - (parsed.ts || 0) > COMPARE_TTL_MS) return null
    return parsed.payload || null
  } catch { return null }
}
