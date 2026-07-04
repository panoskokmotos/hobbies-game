// ─── BADGES ───────────────────────────────────────────────────────────────────

export const BADGES = [
  { id: 'first_swipe',  emoji: '👆', name: 'First Taste',       desc: 'Made your first swipe',     check: s => s.liked >= 1 },
  { id: 'collector',   emoji: '💎', name: 'Collector',          desc: 'Liked 10 interests',        check: s => s.liked >= 10 },
  { id: 'streak_7',    emoji: '🔥', name: 'Dedicated',          desc: '7-day streak',              check: s => s.streak >= 7 },
  { id: 'first_match', emoji: '💜', name: 'First Match',        desc: 'Your first mutual match',   check: s => s.matches >= 1 },
  { id: 'butterfly',   emoji: '🦋', name: 'Social Butterfly',   desc: '5 mutual matches',          check: s => s.matches >= 5 },
  { id: 'polymath',    emoji: '🌟', name: 'True Polymath',      desc: 'Explored all 50 interests', check: s => s.liked >= 50 },
  { id: 'complete',    emoji: '🏆', name: 'Completionist',      desc: 'Filled in your bio',        check: s => s.hasBio },
]
