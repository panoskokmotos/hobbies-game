// ─── FALLBACK RECS ────────────────────────────────────────────────────────────

export const FALLBACK_RECS = {
  hobbies: [
    { emoji: '🎭', title: 'Improv Theatre',    reason: 'Unlocks spontaneity and presence you never knew you had' },
    { emoji: '🍶', title: 'Fermentation',      reason: 'A slow craft that rewards patience and curiosity equally' },
    { emoji: '🧩', title: 'Puzzle Design',     reason: 'Create the experiences others will lose themselves in' },
  ],
  skills: [
    { emoji: '🎨', title: 'Generative Art',   reason: 'The intersection of code, mathematics, and beauty' },
    { emoji: '🧘', title: 'Breathwork',        reason: 'The performance edge hiding in plain sight' },
    { emoji: '🌍', title: 'A Second Language', reason: 'A second language is a second soul' },
  ],
  bucket: [
    { emoji: '🏔️', title: 'Backcountry Trek',   reason: 'Test every limit you have built so far' },
    { emoji: '🌅', title: 'Artist Residency',    reason: 'Uninterrupted time to make your deepest work' },
    { emoji: '🚢', title: 'Open Ocean Crossing', reason: 'A journey that will permanently rewire you' },
  ],
}

export const REC_SECTIONS = [
  { key: 'hobbies', title: 'Try This',   subtitle: 'New hobbies to explore',   color: '#f59e0b' },
  { key: 'skills',  title: 'Learn This', subtitle: 'Skills to master',          color: '#8b5cf6' },
  { key: 'bucket',  title: 'Live This',  subtitle: 'Bucket list experiences',   color: '#10b981' },
]
