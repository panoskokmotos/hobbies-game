import { CATEGORIES } from '../data/categories.js'
import { ARCHETYPES, DEFAULT_ARCHETYPE, ALL_ARCHETYPES } from '../data/archetypes.js'
import { WHY_PHRASES } from '../data/whyPhrases.js'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function computeScores(liked) {
  const s = Object.fromEntries(CATEGORIES.map(c => [c, 0]))
  liked.forEach(card => { if (s[card.category] !== undefined) s[card.category]++ })
  return s
}

export function computeArchetype(liked) {
  const s = computeScores(liked)
  return [...ARCHETYPES].sort((a, b) => b.priority - a.priority).find(a => a.test(s)) ?? DEFAULT_ARCHETYPE
}

export function encodeProfile(archetypeId, likedIds) {
  try {
    // URL-safe base64 (base64url, no padding). Plain btoa can emit `+` and `/`,
    // which URLSearchParams turns into spaces when the `?p=` link is opened —
    // silently breaking decode for those payloads. base64url survives the round
    // trip untouched.
    return btoa(JSON.stringify({ a: archetypeId, l: likedIds }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch { return '' }
}

export function decodeProfile(search) {
  try {
    const raw = new URLSearchParams(search).get('p')
    if (!raw) return null
    // Accept base64url (new links) and standard base64 (older ones): normalize
    // back to standard alphabet and re-pad before decoding.
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const { a, l } = JSON.parse(atob(b64))
    const archetype = ALL_ARCHETYPES.find(x => x.id === a) ?? null
    const likedIds = Array.isArray(l) ? l : []
    return archetype ? { archetype, likedIds } : null
  } catch {
    return null
  }
}

export function getShareUrl(archetype, liked) {
  const payload = encodeProfile(archetype.id, liked.map(c => c.id))
  return `${window.location.origin}${window.location.pathname}?p=${payload}`
}

export function whyWeMatch(scoresA, scoresB) {
  if (!scoresA || !scoresB) return null
  const shared = CATEGORIES
    .filter(c => (scoresA[c] || 0) > 0 && (scoresB[c] || 0) > 0)
    .sort((a, b) => Math.min(scoresA[b] || 0, scoresB[b] || 0) - Math.min(scoresA[a] || 0, scoresB[a] || 0))
  return shared.length ? (WHY_PHRASES[shared[0]] ?? null) : null
}

export function timeAgo(ts) {
  const ms = Date.now() - new Date(ts).getTime()
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'just now'
}

export function alienReaction(liked) {
  if (!liked || liked.length === 0) return "I see potential. Show me what you love."
  const scores = computeScores(liked)
  const diverse = Object.values(scores).filter(v => v > 0).length
  if (diverse >= 3) return "You contain multitudes. I had to stop you."
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0]
  if (top === 'mind') return "A thinker. Rarer than you know."
  if (top === 'physical') return "You live in your body. I respect that."
  if (top === 'creative') return "You make things. That changes everything."
  if (top === 'music') return "You hear the world differently. Literally."
  if (top === 'exploration') return "You move. You seek. You find."
  if (top === 'social') return "People come alive around you. Don't waste that."
  if (top === 'craft') return "You build things with your hands. That's rare and beautiful."
  if (top === 'spiritual') return "You're looking inward. Most people never dare."
  if (top === 'tech') return "You build the future. You know it, too."
  if (top === 'culinary') return "You understand pleasure. That's a form of wisdom."
  return "I've seen enough. You're one of them."
}
