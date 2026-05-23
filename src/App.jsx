import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, X, ChevronRight, Download, Copy, Check, RefreshCw, Share2, Zap, User, Compass, MessageCircle, LogOut, Eye, EyeOff } from 'lucide-react'
import { bb } from './lib/butterbase.js'
import {
  signUp, signIn, signOut, signInWithGoogle, signInWithApple,
  getSession, onAuthStateChange,
  saveProfile, getMyProfile, updateProfile, getDiscoveryProfiles,
  recordSwipe, checkMutualLike, createMatch, getMyMatches,
  getMessages, sendMessage, getAdmirers,
  compatibilityScore,
} from './lib/api.js'

const QUICK_LIMIT = 5

// ─── CARD DATA (50 cards) ─────────────────────────────────────────────────────

const CARDS = [
  // First 5 cover 5 distinct categories → best archetype detection from quick swipe
  { id: 3,  emoji: '🧠', label: 'Philosophy',        category: 'mind'        },
  { id: 8,  emoji: '✍️', label: 'Writing',           category: 'creative'    },
  { id: 1,  emoji: '🏃', label: 'Running',           category: 'physical'    },
  { id: 10, emoji: '🎉', label: 'Hosting',           category: 'social'      },
  { id: 4,  emoji: '✈️', label: 'Solo Travel',       category: 'exploration' },
  // Remaining 45 cards
  { id: 2,  emoji: '🎸', label: 'Guitar',            category: 'music'       },
  { id: 5,  emoji: '🍳', label: 'Cooking',           category: 'culinary'    },
  { id: 6,  emoji: '🧘', label: 'Meditation',        category: 'spiritual'   },
  { id: 7,  emoji: '🧗', label: 'Climbing',          category: 'physical'    },
  { id: 9,  emoji: '🍷', label: 'Wine & Food',       category: 'culinary'    },
  { id: 11, emoji: '🔭', label: 'Astronomy',         category: 'mind'        },
  { id: 12, emoji: '🎬', label: 'Filmmaking',        category: 'creative'    },
  { id: 13, emoji: '🏄', label: 'Surfing',           category: 'physical'    },
  { id: 14, emoji: '🎯', label: 'Strategy Games',    category: 'mind'        },
  { id: 15, emoji: '🌐', label: 'Language Learning', category: 'mind'        },
  { id: 16, emoji: '💃', label: 'Dancing',           category: 'social'      },
  { id: 17, emoji: '🎙️', label: 'Podcasting',        category: 'creative'    },
  { id: 18, emoji: '📔', label: 'Journaling',        category: 'mind'        },
  { id: 19, emoji: '🥋', label: 'Martial Arts',      category: 'physical'    },
  { id: 20, emoji: '📸', label: 'Photography',       category: 'creative'    },
  { id: 21, emoji: '⛷️', label: 'Skiing',            category: 'physical'    },
  { id: 22, emoji: '⛵', label: 'Sailing',           category: 'exploration' },
  { id: 23, emoji: '🎤', label: 'Stand-up Comedy',  category: 'social'      },
  { id: 24, emoji: '🐝', label: 'Beekeeping',        category: 'craft'       },
  { id: 25, emoji: '🏺', label: 'Pottery',           category: 'craft'       },
  { id: 26, emoji: '♟️', label: 'Chess',             category: 'mind'        },
  { id: 27, emoji: '🤿', label: 'Scuba Diving',      category: 'exploration' },
  { id: 28, emoji: '📈', label: 'Investing',         category: 'tech'        },
  { id: 29, emoji: '📝', label: 'Blogging',          category: 'creative'    },
  { id: 30, emoji: '🗣️', label: 'Public Speaking',  category: 'social'      },
  { id: 31, emoji: '🌿', label: 'Foraging',          category: 'exploration' },
  { id: 32, emoji: '🏛️', label: 'Architecture',     category: 'creative'    },
  { id: 33, emoji: '⭐', label: 'Astrology',         category: 'spiritual'   },
  { id: 34, emoji: '🎭', label: 'Improv Theatre',    category: 'social'      },
  { id: 35, emoji: '🌳', label: 'Genealogy',         category: 'mind'        },
  { id: 36, emoji: '🎛️', label: 'DJing',             category: 'music'       },
  { id: 37, emoji: '🥁', label: 'Drumming',          category: 'music'       },
  { id: 38, emoji: '🎼', label: 'Singing',           category: 'music'       },
  { id: 39, emoji: '🏊', label: 'Swimming',          category: 'physical'    },
  { id: 40, emoji: '🤸', label: 'Parkour',           category: 'physical'    },
  { id: 41, emoji: '🧘‍♀️', label: 'Yoga',             category: 'spiritual'   },
  { id: 42, emoji: '🪵', label: 'Woodworking',       category: 'craft'       },
  { id: 43, emoji: '🦢', label: 'Origami',           category: 'craft'       },
  { id: 44, emoji: '🖌️', label: 'Calligraphy',       category: 'creative'    },
  { id: 45, emoji: '📱', label: 'App Development',   category: 'tech'        },
  { id: 46, emoji: '🎮', label: 'Game Dev',          category: 'tech'        },
  { id: 47, emoji: '🍞', label: 'Baking',            category: 'culinary'    },
  { id: 48, emoji: '🍹', label: 'Cocktail Mixing',   category: 'culinary'    },
  { id: 49, emoji: '🃏', label: 'Tarot',             category: 'spiritual'   },
  { id: 50, emoji: '🌱', label: 'Permaculture',      category: 'exploration' },
]

const CATEGORIES = ['physical', 'music', 'mind', 'creative', 'exploration', 'social', 'craft', 'tech', 'culinary', 'spiritual']

const CATEGORY_LABELS = {
  physical: 'Physical', music: 'Music', mind: 'Mind', creative: 'Creative',
  exploration: 'Explore', social: 'Social', craft: 'Craft', tech: 'Tech',
  culinary: 'Culinary', spiritual: 'Spiritual',
}

const CATEGORY_COLORS = {
  physical: '#f59e0b', music: '#8b5cf6', mind: '#3b82f6', creative: '#ec4899',
  exploration: '#10b981', social: '#f97316', craft: '#84cc16', tech: '#06b6d4',
  culinary: '#ef4444', spiritual: '#a78bfa',
}

// ─── ARCHETYPES ───────────────────────────────────────────────────────────────

const ARCHETYPES = [
  {
    id: 'renaissance',
    name: 'The Renaissance Soul',
    emoji: '🌟',
    rarity: 3,
    rarityLabel: 'Ultra Rare',
    description: 'You refuse to be defined by a single passion. Your curiosity spans worlds.',
    description2: 'The most dangerous and beautiful mind in any room.',
    test: s => Object.values(s).filter(v => v >= 1).length >= 4,
    priority: 10,
  },
  {
    id: 'philosopher-athlete',
    name: 'The Philosopher-Athlete',
    emoji: '⚡',
    rarity: 8,
    rarityLabel: 'Rare',
    description: 'You train your body and your mind with equal ferocity.',
    description2: 'Where others rest, you push further — in the gym and on the page.',
    test: s => s.physical >= 2 && s.mind >= 2,
    priority: 9,
  },
  {
    id: 'creative-explorer',
    name: 'The Creative Explorer',
    emoji: '🧭',
    rarity: 12,
    rarityLabel: 'Rare',
    description: 'The world is your canvas. Every new place and medium is raw material.',
    description2: 'You document the journey and reshape it into art.',
    test: s => s.creative >= 2 && s.exploration >= 1,
    priority: 8,
  },
  {
    id: 'lone-wolf',
    name: 'The Lone Wolf',
    emoji: '🐺',
    rarity: 14,
    rarityLabel: 'Rare',
    description: 'You move deep rather than wide. Solitude is where you do your best work.',
    description2: 'Independent, fierce, and uncommonly self-reliant.',
    test: s => s.exploration >= 1 && s.mind >= 1 && s.social === 0,
    priority: 7,
  },
  {
    id: 'social-architect',
    name: 'The Social Architect',
    emoji: '🏛️',
    rarity: 16,
    rarityLabel: 'Uncommon',
    description: 'You engineer culture. Rooms, scenes, movements — they form around you.',
    description2: "Connection isn't something you seek; it's something you build.",
    test: s => s.social >= 2 && s.creative >= 1,
    priority: 6,
  },
  {
    id: 'sonic-thinker',
    name: 'The Sonic Thinker',
    emoji: '🎵',
    rarity: 18,
    rarityLabel: 'Uncommon',
    description: 'Sound is how you process the universe. Music is your mother tongue.',
    description2: 'Philosophy and rhythm live in the same part of your brain.',
    test: s => s.music >= 1 && s.mind >= 2,
    priority: 5,
  },
  {
    id: 'digital-native',
    name: 'The Digital Native',
    emoji: '💻',
    rarity: 20,
    rarityLabel: 'Uncommon',
    description: 'You speak in systems, pixels, and algorithms — fluently.',
    description2: "Technology isn't a tool for you. It's a language.",
    test: s => s.tech >= 1 && s.creative >= 1 && s.mind >= 1,
    priority: 4,
  },
  {
    id: 'craft-obsessive',
    name: 'The Craft Obsessive',
    emoji: '🔨',
    rarity: 22,
    rarityLabel: 'Common',
    description: 'You believe in making things with your hands. The process is the point.',
    description2: "You'll spend 100 hours to perfect what others settle for in 10.",
    test: s => s.craft >= 1 && s.physical >= 1,
    priority: 3,
  },
  {
    id: 'sensualist',
    name: 'The Sensualist',
    emoji: '🌹',
    rarity: 25,
    rarityLabel: 'Common',
    description: 'You live through your senses. The best meal, the finest wine, the perfect moment.',
    description2: 'Life, for you, is meant to be savored — not just experienced.',
    test: s => s.culinary >= 1 && s.social >= 1,
    priority: 2,
  },
]

const DEFAULT_ARCHETYPE = {
  id: 'free-spirit',
  name: 'The Free Spirit',
  emoji: '🦋',
  rarity: 35,
  rarityLabel: 'Common',
  description: "You're still writing your story. Every chapter is wide open.",
  description2: 'The most exciting chapter is yet to come.',
  priority: 0,
}

const ALL_ARCHETYPES = [...ARCHETYPES, DEFAULT_ARCHETYPE]

// ─── SEED PROFILES ────────────────────────────────────────────────────────────

const SEED_PROFILES = [
  {
    name: 'Mia Chen',
    avatar: '🎨',
    archetype: 'The Creative Explorer',
    interests: ['📸 Photography', '🏄 Surfing', '✍️ Writing', '✈️ Solo Travel', '🎬 Filmmaking'],
    why: 'Your curiosity and creative eye would spark incredible conversations.',
    color: '#ec4899',
  },
  {
    name: 'Orion Vasquez',
    avatar: '⚡',
    archetype: 'The Philosopher-Athlete',
    interests: ['🏃 Running', '🧠 Philosophy', '♟️ Chess', '🧗 Climbing', '📔 Journaling'],
    why: "You'd challenge each other to grow — mentally and physically.",
    color: '#3b82f6',
  },
  {
    name: 'Freya Andersen',
    avatar: '🌿',
    archetype: 'The Digital Native',
    interests: ['📱 App Dev', '🎙️ Podcasting', '🌿 Foraging', '📸 Photography', '🎸 Guitar'],
    why: 'Your analog passions and her digital world make a rare combination.',
    color: '#10b981',
  },
]

// ─── FALLBACK RECS ────────────────────────────────────────────────────────────

const FALLBACK_RECS = {
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

const REC_SECTIONS = [
  { key: 'hobbies', title: 'Try This',   subtitle: 'New hobbies to explore',   color: '#f59e0b' },
  { key: 'skills',  title: 'Learn This', subtitle: 'Skills to master',          color: '#8b5cf6' },
  { key: 'bucket',  title: 'Live This',  subtitle: 'Bucket list experiences',   color: '#10b981' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function computeScores(liked) {
  const s = Object.fromEntries(CATEGORIES.map(c => [c, 0]))
  liked.forEach(card => { if (s[card.category] !== undefined) s[card.category]++ })
  return s
}

function computeArchetype(liked) {
  const s = computeScores(liked)
  return [...ARCHETYPES].sort((a, b) => b.priority - a.priority).find(a => a.test(s)) ?? DEFAULT_ARCHETYPE
}

function encodeProfile(archetypeId, likedIds) {
  try { return btoa(JSON.stringify({ a: archetypeId, l: likedIds })) } catch { return '' }
}

function getShareUrl(archetype, liked) {
  const payload = encodeProfile(archetype.id, liked.map(c => c.id))
  return `${window.location.origin}${window.location.pathname}?p=${payload}`
}

function timeAgo(ts) {
  const ms = Date.now() - new Date(ts).getTime()
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'just now'
}

function saveState(archetype, liked, recommendations) {
  try {
    localStorage.setItem('polymath_v1', JSON.stringify({
      archetypeId: archetype.id,
      likedIds: liked.map(c => c.id),
      recs: recommendations,
    }))
  } catch {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('polymath_v1')
    if (!raw) return null
    const { archetypeId, likedIds, recs } = JSON.parse(raw)
    const liked = likedIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean)
    const archetype = ALL_ARCHETYPES.find(a => a.id === archetypeId) ?? DEFAULT_ARCHETYPE
    return { archetype, liked, recommendations: recs }
  } catch { return null }
}

function alienReaction(liked) {
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

function loadStreak() {
  try {
    const raw = localStorage.getItem('polymath_streak')
    return raw ? JSON.parse(raw) : { count: 0, lastDate: null }
  } catch { return { count: 0, lastDate: null } }
}

function updateStreak() {
  const today = new Date().toDateString()
  const s = loadStreak()
  if (s.lastDate === today) return s
  const gracePrev = new Date(Date.now() - 26 * 3600 * 1000).toDateString()
  const count = s.lastDate === gracePrev ? s.count + 1 : 1
  const next = { count, lastDate: today }
  try { localStorage.setItem('polymath_streak', JSON.stringify(next)) } catch {}
  return next
}

// ─── SOUND ────────────────────────────────────────────────────────────────────

function useSwipeSound() {
  const ctxRef = useRef(null)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }

  return useCallback((direction) => {
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      if (direction === 'right') {
        osc.frequency.setValueAtTime(420, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.12)
        gain.gain.setValueAtTime(0.07, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
      } else {
        osc.frequency.setValueAtTime(340, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.14)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [])
}

// ─── RADAR CHART ──────────────────────────────────────────────────────────────

function RadarChart({ scores, size = 280, animate = false }) {
  const cx = size / 2, cy = size / 2
  const maxR = size * 0.32, labelR = maxR + 24
  const n = CATEGORIES.length
  const [drawn, setDrawn] = useState(!animate)

  useEffect(() => {
    if (animate) { const t = setTimeout(() => setDrawn(true), 100); return () => clearTimeout(t) }
  }, [animate])

  const toXY = (i, r) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const gridPts = level =>
    CATEGORIES.map((_, i) => { const p = toXY(i, maxR * level); return `${p.x},${p.y}` }).join(' ')

  const dataPts = CATEGORIES.map((cat, i) => {
    const r = drawn ? (Math.min(scores[cat] || 0, 8) / 8) * maxR : 0
    const p = toXY(i, r)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(level => (
        <polygon key={level} points={gridPts(level)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {CATEGORIES.map((_, i) => {
        const p = toXY(i, maxR)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      })}
      <polygon points={dataPts} fill="rgba(251,191,36,0.18)" stroke="#fbbf24" strokeWidth="2"
        style={{ transition: drawn ? 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }} />
      {CATEGORIES.map((cat, i) => {
        const val = scores[cat] || 0
        const r = drawn ? (Math.min(val, 8) / 8) * maxR : 0
        const p = toXY(i, r)
        return <circle key={cat} cx={p.x} cy={p.y} r={val > 0 ? 4 : 2}
          fill={val > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
          style={{ transition: drawn ? 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }} />
      })}
      {CATEGORIES.map((cat, i) => {
        const p = toXY(i, labelR)
        const score = scores[cat] || 0
        return (
          <text key={cat} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
            fill={score > 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)'}
            fontSize="9.5" fontFamily="system-ui,sans-serif" fontWeight={score > 0 ? '600' : '400'}>
            {CATEGORY_LABELS[cat]}
          </text>
        )
      })}
    </svg>
  )
}

// ─── RETURNING USER SCREEN ────────────────────────────────────────────────────

function ReturningUserScreen({ saved, onContinue, onRestart }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { setTimeout(() => setPhase(1), 100) }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-xs text-center"
        style={{
          opacity: phase ? 1 : 0,
          transform: phase ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
        <div className="text-6xl mb-4 animate-float">{saved.archetype.emoji}</div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#fbbf24' }}>
          Welcome back
        </p>
        <h1 className="text-white text-3xl font-bold mb-2 leading-tight"
          style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em' }}>
          {saved.archetype.name}
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          You've already discovered your archetype. Pick up where you left off?
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {saved.liked.slice(0, 8).map(c => (
            <span key={c.id} className="px-3 py-1.5 rounded-full text-sm"
              style={{
                background: `${CATEGORY_COLORS[c.category]}12`,
                color: CATEGORY_COLORS[c.category],
                border: `1px solid ${CATEGORY_COLORS[c.category]}28`,
              }}>
              {c.emoji} {c.label}
            </span>
          ))}
          {saved.liked.length > 8 && (
            <span className="px-3 py-1.5 rounded-full text-sm" style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              +{saved.liked.length - 8} more
            </span>
          )}
        </div>

        <button onClick={onContinue}
          className="w-full py-4 rounded-2xl text-black font-bold text-base mb-3 transition-all duration-200 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 40px rgba(251,191,36,0.25)' }}>
          Continue to My Profile
        </button>
        <button onClick={onRestart}
          className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <RefreshCw size={13} className="inline mr-1.5" />
          Start fresh
        </button>
      </div>
    </div>
  )
}

// ─── SWIPE SCREEN ─────────────────────────────────────────────────────────────

function SwipeScreen({ onComplete, onQuickComplete, startIndex = 0, initialLiked = [] }) {
  const [index, setIndex] = useState(startIndex)
  const [liked, setLiked] = useState(initialLiked)
  const [exiting, setExiting] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const indexRef = useRef(startIndex)
  const likedRef = useRef(initialLiked)
  const isDeciding = useRef(false)
  const dragStart = useRef(null)
  const playSwipe = useSwipeSound()
  const consecutiveRight = useRef(0)
  const [streakMsg, setStreakMsg] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset({ x: 20, y: 0 })
      setTimeout(() => setOffset({ x: 0, y: 0 }), 420)
    }, 900)
    return () => clearTimeout(t)
  }, [])

  const decide = useCallback((direction) => {
    if (isDeciding.current) return
    isDeciding.current = true
    playSwipe(direction)
    if (navigator.vibrate) navigator.vibrate(direction === 'right' ? [30] : [10, 10])
    setExiting(direction)
    setDragging(false)

    const currentCard = CARDS[indexRef.current]
    const currentLiked = likedRef.current

    setTimeout(() => {
      const newLiked = direction === 'right' ? [...currentLiked, currentCard] : [...currentLiked]
      const newIndex = indexRef.current + 1

      likedRef.current = newLiked
      indexRef.current = newIndex
      setLiked(newLiked)
      setIndex(newIndex)
      setOffset({ x: 0, y: 0 })
      setExiting(null)
      isDeciding.current = false
      dragStart.current = null

      if (direction === 'right') {
        consecutiveRight.current += 1
        const n = consecutiveRight.current
        const totalLikes = newLiked.length
        let msg = null
        if (n === 3) msg = "You're drawn to this. I see it. ✨"
        else if (n === 5) msg = "A collector. I love that. 🔥"
        else if (totalLikes === 10) msg = "10 passions and counting 💫"
        if (msg) {
          setStreakMsg(msg)
          setTimeout(() => setStreakMsg(null), 2200)
        }
      } else {
        consecutiveRight.current = 0
      }

      if (onQuickComplete && newIndex >= QUICK_LIMIT + startIndex) onQuickComplete(newLiked)
      else if (newIndex >= CARDS.length) onComplete(newLiked)
    }, 380)
  }, [onComplete, playSwipe])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight') decide('right')
      if (e.key === 'ArrowLeft') decide('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decide])

  const onPointerDown = e => {
    if (isDeciding.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
  }
  const onPointerMove = e => {
    if (!dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }
  const onPointerUp = () => {
    if (!dragStart.current) return
    if (offset.x > 80) decide('right')
    else if (offset.x < -80) decide('left')
    else { setOffset({ x: 0, y: 0 }); setDragging(false) }
    dragStart.current = null
  }

  if (index >= CARDS.length) return null

  const card = CARDS[index]
  const nextCard = CARDS[index + 1]
  const thirdCard = CARDS[index + 2]
  const rotation = offset.x * 0.1
  const swipeDir = offset.x > 50 ? 'right' : offset.x < -50 ? 'left' : null
  const rightOpacity = Math.min(1, Math.max(0, offset.x / 90))
  const leftOpacity = Math.min(1, Math.max(0, -offset.x / 90))

  let cardTransform = `translateX(${offset.x}px) translateY(${offset.y * 0.25}px) rotate(${rotation}deg)`
  let cardTransition = dragging ? 'none' : 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
  if (exiting === 'right') { cardTransform = 'translateX(150vw) rotate(30deg)'; cardTransition = 'transform 0.38s cubic-bezier(0.55,0,1,0.45)' }
  if (exiting === 'left')  { cardTransform = 'translateX(-150vw) rotate(-30deg)'; cardTransition = 'transform 0.38s cubic-bezier(0.55,0,1,0.45)' }

  const glowColor = swipeDir === 'right'
    ? '0 0 70px rgba(251,191,36,0.45), 0 30px 80px rgba(0,0,0,0.6)'
    : swipeDir === 'left'
    ? '0 0 70px rgba(59,130,246,0.45), 0 30px 80px rgba(0,0,0,0.6)'
    : '0 30px 80px rgba(0,0,0,0.6)'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center select-none"
      style={{ background: '#0a0a0f', paddingBottom: 32 }}>

      <div className="w-full max-w-xs px-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
            polymath
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{index - startIndex}/{onQuickComplete ? QUICK_LIMIT : CARDS.length}</span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((index - startIndex) / (onQuickComplete ? QUICK_LIMIT : CARDS.length)) * 100}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
        </div>
        {liked.length > 0 && (
          <p className="text-xs mt-1.5 text-right" style={{ color: 'rgba(251,191,36,0.7)' }}>
            {liked.length} loved ✦
          </p>
        )}
      </div>

      <div className="relative" style={{ width: 320, height: 460 }}>
        {thirdCard && (
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(145deg,#141428,#0e1020)', transform: 'scale(0.86) translateY(28px)', border: '1px solid rgba(255,255,255,0.04)' }} />
        )}
        {nextCard && (
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(145deg,#181830,#141428)', transform: 'scale(0.93) translateY(16px)', border: '1px solid rgba(255,255,255,0.05)' }} />
        )}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ background: 'linear-gradient(145deg,#1c1c34,#161628)', border: '1px solid rgba(255,255,255,0.1)', transform: cardTransform, transition: cardTransition, boxShadow: glowColor, touchAction: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
            <div style={{ position: 'absolute', inset: 0, background: swipeDir === 'right' ? 'radial-gradient(circle at 30% 50%, rgba(251,191,36,0.1) 0%, transparent 60%)' : swipeDir === 'left' ? 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.1) 0%, transparent 60%)' : 'none', transition: 'background 0.2s' }} />
          </div>

          <div className="absolute top-8 left-7 pointer-events-none" style={{ opacity: rightOpacity, transform: 'rotate(-14deg)' }}>
            <div className="px-4 py-1.5 rounded-xl" style={{ border: '2.5px solid #fbbf24', background: 'rgba(251,191,36,0.12)' }}>
              <span className="font-black text-lg tracking-widest" style={{ color: '#fbbf24' }}>LOVE IT</span>
            </div>
          </div>
          <div className="absolute top-8 right-7 pointer-events-none" style={{ opacity: leftOpacity, transform: 'rotate(14deg)' }}>
            <div className="px-4 py-1.5 rounded-xl" style={{ border: '2.5px solid #60a5fa', background: 'rgba(96,165,250,0.12)' }}>
              <span className="font-black text-lg tracking-widest" style={{ color: '#60a5fa' }}>NOT ME</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: `${CATEGORY_COLORS[card.category]}18`, color: CATEGORY_COLORS[card.category], border: `1px solid ${CATEGORY_COLORS[card.category]}35` }}>
              {CATEGORY_LABELS[card.category]}
            </span>
          </div>
          <div className="text-[88px] leading-none mb-5 pointer-events-none">{card.emoji}</div>
          <h2 className="text-white text-3xl font-bold text-center px-6 leading-tight pointer-events-none"
            style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
            {card.label}
          </h2>
          <p className="mt-8 text-xs pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
            ← drag · arrow keys →
          </p>
        </div>
      </div>

      {streakMsg && (
        <div className="mt-6 px-5 py-2.5 rounded-2xl text-sm font-semibold text-center animate-bounce-in"
          style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', maxWidth: 280 }}>
          {streakMsg}
        </div>
      )}

      <div className="flex gap-10 mt-6">
        <button onClick={() => decide('left')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1.5px solid rgba(96,165,250,0.35)' }}>
          <X size={26} color="#60a5fa" />
        </button>
        <button onClick={() => decide('right')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1.5px solid rgba(251,191,36,0.35)' }}>
          <Heart size={26} color="#fbbf24" />
        </button>
      </div>
    </div>
  )
}

// ─── ALIEN PROPOSAL SCREEN ───────────────────────────────────────────────────

function AlienProposalScreen({ liked, archetype, scores, recommendations, onSignedUp, onSkip }) {
  const [phase, setPhase] = useState(0)
  const [authMode, setAuthMode] = useState(null) // null | 'email'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // 'google' | 'apple'
  const [error, setError] = useState(null)
  const [emailConfirm, setEmailConfirm] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 120)
    const t2 = setTimeout(() => setPhase(2), 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider)
    setError(null)
    try {
      localStorage.setItem('polymath_quick', JSON.stringify({ likedIds: liked.map(c => c.id) }))
      if (provider === 'google') await signInWithGoogle()
      else await signInWithApple()
    } catch (err) {
      setError('Could not open sign-in. Try email instead.')
      localStorage.removeItem('polymath_quick')
    }
    setSocialLoading(null)
  }

  const handleEmailSignUp = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error: authErr } = await signUp({ name, email, password })
      if (authErr) { setError(authErr.message || 'Sign up failed'); setLoading(false); return }
      const userId = data?.user?.id
      if (userId) {
        await saveProfile(userId, { archetype, liked, scores, recommendations, displayName: name })
        onSignedUp(data.user)
      } else {
        setEmailConfirm(true)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  if (emailConfirm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0a0a0f' }}>
        <div className="w-full max-w-xs text-center">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em' }}>
            Check your inbox
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
            We sent a confirmation link to <span style={{ color: '#fbbf24' }}>{email}</span>. Click it and come back to explore.
          </p>
          <button onClick={onSkip}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Continue without account →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 25%, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-xs relative z-10">
        {/* Alien + headline */}
        <div className="text-center mb-6"
          style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="text-7xl mb-2 animate-float" style={{ display: 'inline-block' }}>👽</div>
          <div className="text-3xl -mt-2 mb-4">💍</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#8b5cf6' }}>
            The alien has spoken
          </p>
          <h1 className="text-white text-3xl font-bold leading-tight mb-2"
            style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em' }}>
            {alienReaction(liked)}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Will you join Polymath? Your archetype awaits — and so do your people.
          </p>
        </div>

        {/* Liked cards pills */}
        {liked.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-6"
            style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.5s 0.1s ease, transform 0.5s 0.1s ease' }}>
            {liked.map(c => (
              <span key={c.id} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: `${CATEGORY_COLORS[c.category]}15`, color: CATEGORY_COLORS[c.category], border: `1px solid ${CATEGORY_COLORS[c.category]}30` }}>
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        )}

        {/* Auth section */}
        <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s 0.2s ease, transform 0.5s 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
          {error && (
            <div className="rounded-xl px-4 py-2.5 mb-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {authMode !== 'email' && (
            <>
              {/* Google button */}
              <button
                onClick={() => handleSocialAuth('google')}
                disabled={!!socialLoading}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 mb-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'white', color: '#1f1f1f', opacity: socialLoading ? 0.7 : 1 }}>
                {socialLoading === 'google' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                {socialLoading === 'google' ? 'Opening Google…' : 'Continue with Google'}
              </button>

              {/* Apple button */}
              <button
                onClick={() => handleSocialAuth('apple')}
                disabled={!!socialLoading}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 mb-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#1a1a1a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', opacity: socialLoading ? 0.7 : 1 }}>
                {socialLoading === 'apple' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                ) : (
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="white">
                    <path d="M14.04 8.862c-.02-2.175 1.784-3.228 1.864-3.28-1.019-1.487-2.598-1.69-3.154-1.708-1.33-.136-2.61.788-3.286.788-.676 0-1.7-.773-2.8-.751-1.428.021-2.758.839-3.492 2.118C1.675 8.55 2.76 13.1 4.303 15.168c.768 1.102 1.682 2.333 2.876 2.29 1.16-.048 1.596-.742 2.997-.742 1.4 0 1.797.742 3.012.717 1.248-.02 2.033-1.111 2.787-2.22.893-1.272 1.253-2.515 1.268-2.578-.027-.012-2.42-.924-2.443-3.673zM11.773 2.54C12.377 1.81 12.78.82 12.664-.2c-.857.037-1.91.574-2.53 1.286-.549.633-1.035 1.655-.905 2.631.957.073 1.938-.484 2.544-1.177z"/>
                  </svg>
                )}
                {socialLoading === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>or</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <button onClick={() => setAuthMode('email')}
                className="w-full py-3 rounded-xl text-sm font-medium mb-5 transition-all hover:opacity-80"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                Continue with Email
              </button>
            </>
          )}

          {authMode === 'email' && (
            <form onSubmit={handleEmailSignUp} className="space-y-2.5 mb-5">
              <button type="button" onClick={() => setAuthMode(null)} className="text-xs mb-1 transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.3)' }}>← back</button>
              <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none pr-10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating account…' : 'Join Polymath →'}
              </button>
            </form>
          )}

          <button onClick={onSkip}
            className="w-full text-xs transition-opacity hover:opacity-70 text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Skip for now — explore first →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ARCHETYPE SCREEN ─────────────────────────────────────────────────────────

function ArchetypeScreen({ archetype, liked, onNext }) {
  const [phase, setPhase] = useState(0)
  const scores = computeScores(liked)
  const topCats = CATEGORIES.filter(c => scores[c] > 0).sort((a, b) => scores[b] - scores[a])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500)
    const t2 = setTimeout(() => setPhase(2), 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}>
      <div className="absolute inset-0 pointer-events-none animate-glow-pulse"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(251,191,36,0.14) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.25) 0%, transparent 55%)', opacity: phase === 0 ? 1 : 0 }} />

      <div className="w-full max-w-sm relative z-10"
        style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="flex justify-center mb-5">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em]"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            {archetype.rarityLabel} · {archetype.rarity}% of users
          </span>
        </div>
        <div className="text-center text-7xl mb-5 animate-float">{archetype.emoji}</div>
        <h1 className="text-center text-white mb-4 leading-tight"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em' }}>
          {archetype.name}
        </h1>
        <p className="text-center text-xs mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {Math.round(21000 * archetype.rarity / 100)} Polymaths worldwide share this archetype
        </p>
        <p className="text-center text-lg leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>{archetype.description}</p>
        <p className="text-center text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>{archetype.description2}</p>

        <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'scale(1)' : 'scale(0.8)', transition: 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="rounded-3xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <RadarChart scores={scores} size={280} animate />
          </div>
          {topCats.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {topCats.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: `${CATEGORY_COLORS[cat]}15`, color: CATEGORY_COLORS[cat], border: `1px solid ${CATEGORY_COLORS[cat]}30` }}>
                  {CATEGORY_LABELS[cat]} <span style={{ opacity: 0.6 }}>×{scores[cat]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onNext}
          className="w-full py-4 rounded-2xl text-black font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 40px rgba(251,191,36,0.3)' }}>
          See What's Next For Me <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// ─── RECOMMENDATIONS SCREEN ───────────────────────────────────────────────────

function RecommendationsScreen({ liked, onNext }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState(0)
  const [apiKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [usingFallback, setUsingFallback] = useState(false)
  const hasFetched = useRef(false)

  const fetchRecs = useCallback(async (key) => {
    hasFetched.current = true
    setLoading(true)
    setData(null)
    const interests = liked.map(c => `${c.label} (${c.category})`).join(', ')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-calls': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'You are a life expansion advisor. Given a person\'s interests, recommend exactly 9 things they should try next — 3 new hobbies, 3 skills to learn, and 3 bucket list experiences. Each recommendation must feel surprising yet inevitable given their profile. Return ONLY valid JSON, no markdown, no preamble: {"hobbies":[{"emoji":"...","title":"...","reason":"..."}],"skills":[{"emoji":"...","title":"...","reason":"..."}],"bucket":[{"emoji":"...","title":"...","reason":"..."}]}',
          messages: [{ role: 'user', content: `My interests: ${interests || 'open to everything'}` }],
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(JSON.parse(json.content?.[0]?.text || ''))
      setUsingFallback(false)
    } catch {
      setData(FALLBACK_RECS)
      setUsingFallback(true)
    }
    setLoading(false)
    setTimeout(() => setPhase(1), 150)
  }, [liked])

  useEffect(() => { if (!hasFetched.current) fetchRecs(apiKey) }, [fetchRecs, apiKey])

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0a0a0f' }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-white mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em' }}>
            Your Expansion Map
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {usingFallback ? 'Curated for your interests' : 'AI-curated for your profile'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border border-amber-400 border-b-transparent" style={{ animation: 'spin 1.5s linear infinite reverse' }} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Reading your cosmic profile…</p>
          </div>
        ) : (
          <div style={{ opacity: phase ? 1 : 0, transform: phase ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
            {REC_SECTIONS.map((section, si) => (
              <div key={section.key} className="mb-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: `${section.color}30` }} />
                  <div className="text-center">
                    <span className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif', color: section.color, letterSpacing: '-0.02em' }}>{section.title}</span>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{section.subtitle}</p>
                  </div>
                  <div className="h-px flex-1" style={{ background: `${section.color}30` }} />
                </div>
                <div className="space-y-2.5">
                  {data?.[section.key]?.map((item, i) => (
                    <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
                      style={{ background: `${section.color}09`, border: `1px solid ${section.color}20`, opacity: phase ? 1 : 0, transform: phase ? 'none' : 'translateY(8px)', transition: `opacity 0.5s ${(si * 3 + i) * 60}ms, transform 0.5s ${(si * 3 + i) * 60}ms` }}>
                      <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
                      <div>
                        <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => onNext(data)}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', boxShadow: '0 0 40px rgba(139,92,246,0.25)' }}>
              Meet Your Matches <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MATCHES SCREEN ───────────────────────────────────────────────────────────

function MatchesScreen({ onNext }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { setTimeout(() => setPhase(1), 200) }, [])

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0a0a0f' }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌐</div>
          <h1 className="text-white mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em' }}>Your Tribe</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>People whose curiosity interlocks with yours</p>
        </div>
        <div className="space-y-4 mb-7">
          {SEED_PROFILES.map((profile, i) => (
            <div key={i} className="rounded-3xl p-5"
              style={{ background: 'linear-gradient(145deg,#1a1a2e,#141428)', border: '1px solid rgba(255,255,255,0.07)', opacity: phase ? 1 : 0, transform: phase ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ${i * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${profile.color}15`, border: `1px solid ${profile.color}30` }}>
                  {profile.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{profile.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.archetype}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.interests.map((int, j) => (
                  <span key={j} className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}>{int}</span>
                ))}
              </div>
              <p className="text-xs italic mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>"{profile.why}"</p>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: `${profile.color}12`, color: profile.color, border: `1px solid ${profile.color}30` }}>
                Connect — coming soon
              </button>
            </div>
          ))}
        </div>
        <button onClick={onNext}
          className="w-full py-4 rounded-2xl text-black font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 40px rgba(251,191,36,0.25)' }}>
          See My Profile <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// ─── MATCHING CTA SECTION ─────────────────────────────────────────────────────

function MatchingCTASection({ user, archetype, liked, scores, recommendations, onSaved, onGoDiscover }) {
  const [mode, setMode] = useState('cta') // cta | signup | signin
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  const handleSignUp = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error: authErr } = await signUp({ name, email, password })
      if (authErr) { setError(authErr.message || 'Sign up failed'); setLoading(false); return }
      const userId = data?.user?.id
      if (userId) {
        await saveProfile(userId, { archetype, liked, scores, recommendations, displayName: name })
        setSaved(true)
        onSaved?.(data.user)
      } else {
        setError('Check your email to confirm your account, then sign in.')
      }
    } catch (err) {
      setError(err.message || 'Sign up failed')
    }
    setLoading(false)
  }

  const handleSignIn = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error: authErr } = await signIn({ email, password })
      if (authErr) { setError(authErr.message || 'Sign in failed'); setLoading(false); return }
      const userId = data?.user?.id
      if (userId) {
        const { data: existing } = await getMyProfile(userId)
        if (!existing?.[0]) {
          await saveProfile(userId, { archetype, liked, scores, recommendations, displayName: name || email.split('@')[0] })
        }
        setSaved(true)
        onSaved?.(data.user)
      } else {
        setError('Sign in failed — please check your credentials.')
      }
    } catch (err) {
      setError(err.message || 'Sign in failed')
    }
    setLoading(false)
  }

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider); setError(null)
    try {
      localStorage.setItem('polymath_quick', JSON.stringify({ likedIds: liked.map(c => c.id) }))
      if (provider === 'google') await signInWithGoogle()
      else await signInWithApple()
    } catch (err) {
      setError('Could not open sign-in. Try email instead.')
      localStorage.removeItem('polymath_quick')
    }
    setSocialLoading(null)
  }

  // Already logged in
  if (user) {
    return (
      <div className="rounded-3xl p-6 mb-8 text-center"
        style={{ background: 'linear-gradient(145deg,rgba(16,185,129,0.08),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="text-3xl mb-3">✅</div>
        <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif' }}>Profile saved</p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>You're in. Start discovering people like you.</p>
        <button onClick={onGoDiscover}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white' }}>
          Discover People →
        </button>
      </div>
    )
  }

  if (saved) {
    return (
      <div className="rounded-3xl p-6 mb-8 text-center"
        style={{ background: 'linear-gradient(145deg,rgba(16,185,129,0.08),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="text-3xl mb-3">✅</div>
        <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif' }}>You're in</p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Profile saved. Start meeting your people.</p>
        <button onClick={onGoDiscover}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white' }}>
          Discover People →
        </button>
      </div>
    )
  }

  if (mode === 'cta') {
    return (
      <div className="rounded-3xl p-6 mb-8"
        style={{ background: 'linear-gradient(145deg,#1a1428,#120e20)', border: '1px solid rgba(139,92,246,0.25)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} color="#8b5cf6" />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>Now live</span>
        </div>
        <h3 className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
          Meet real people
        </h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Swipe on real profiles matched to your archetype. Find your intellectual soulmates.
        </p>

        {error && (
          <div className="rounded-xl px-4 py-2.5 mb-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <button
          onClick={() => handleSocialAuth('google')}
          disabled={!!socialLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 mb-2 transition-all hover:scale-[1.02]"
          style={{ background: 'white', color: '#1f1f1f', opacity: socialLoading ? 0.7 : 1 }}>
          {socialLoading === 'google' ? <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" /> : (
            <svg width="16" height="16" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          )}
          {socialLoading === 'google' ? 'Opening Google…' : 'Continue with Google'}
        </button>

        <button
          onClick={() => handleSocialAuth('apple')}
          disabled={!!socialLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 mb-3 transition-all hover:scale-[1.02]"
          style={{ background: '#1a1a1a', color: 'white', border: '1px solid rgba(255,255,255,0.12)', opacity: socialLoading ? 0.7 : 1 }}>
          {socialLoading === 'apple' ? <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" /> : (
            <svg width="15" height="15" viewBox="0 0 17 17" fill="white"><path d="M14.04 8.862c-.02-2.175 1.784-3.228 1.864-3.28-1.019-1.487-2.598-1.69-3.154-1.708-1.33-.136-2.61.788-3.286.788-.676 0-1.7-.773-2.8-.751-1.428.021-2.758.839-3.492 2.118C1.675 8.55 2.76 13.1 4.303 15.168c.768 1.102 1.682 2.333 2.876 2.29 1.16-.048 1.596-.742 2.997-.742 1.4 0 1.797.742 3.012.717 1.248-.02 2.033-1.111 2.787-2.22.893-1.272 1.253-2.515 1.268-2.578-.027-.012-2.42-.924-2.443-3.673zM11.773 2.54C12.377 1.81 12.78.82 12.664-.2c-.857.037-1.91.574-2.53 1.286-.549.633-1.035 1.655-.905 2.631.957.073 1.938-.484 2.544-1.177z"/></svg>
          )}
          {socialLoading === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>or</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <button onClick={() => setMode('signup')}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-2 transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
          Continue with Email →
        </button>
        <button onClick={() => setMode('signin')}
          className="w-full py-2 rounded-xl text-xs transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Already have an account? Sign in
        </button>
      </div>
    )
  }

  const isSignUp = mode === 'signup'
  return (
    <div className="rounded-3xl p-6 mb-8"
      style={{ background: 'linear-gradient(145deg,#1a1428,#120e20)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <button onClick={() => setMode('cta')} className="text-xs mb-4 transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.3)' }}>← back</button>
      <h3 className="text-white font-bold text-xl mb-4" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </h3>
      {error && (
        <div className="rounded-xl px-4 py-2.5 mb-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-2.5">
        {isSignUp && (
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none pr-10"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', opacity: loading ? 0.7 : 1 }}>
          {loading ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Save Profile & Continue →' : 'Sign In →')}
        </button>
      </form>
      <button onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
        className="w-full py-2 mt-2 text-xs transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ tab, onTab, matchCount = 0 }) {
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

// ─── MATCH MODAL ──────────────────────────────────────────────────────────────

function MatchModal({ myArchetype, myLikedCards, theirProfile, onClose, onDiscover }) {
  const [phase, setPhase] = useState(0)
  const [waved, setWaved] = useState(false)
  useEffect(() => { setTimeout(() => setPhase(1), 100) }, [])

  const theirLikedIds = new Set(theirProfile?.liked_card_ids || [])
  const myIds = new Set((myLikedCards || []).map(c => c.id))
  const sharedCards = (myLikedCards || []).filter(c => theirLikedIds.has(c.id)).slice(0, 3)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(10,10,15,0.95)' }}>
      <div className="absolute inset-0 pointer-events-none animate-glow-pulse"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
      <div className="w-full max-w-xs text-center relative z-10"
        style={{ opacity: phase ? 1 : 0, transform: phase ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
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
      </div>
    </div>
  )
}

// ─── DISCOVER SCREEN ──────────────────────────────────────────────────────────

function DiscoverScreen({ user, myProfile, myArchetype, onMatch }) {
  const [profiles, setProfiles] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exiting, setExiting] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [admirer, setAdmirer] = useState(null) // { userId, profile? }

  const isDeciding = useRef(false)
  const indexRef = useRef(0)
  const dragStart = useRef(null)
  const playSwipe = useSwipeSound()

  useEffect(() => {
    Promise.all([
      getDiscoveryProfiles(user.id),
      getAdmirers(user.id),
    ]).then(async ([{ data: profileData }, admireIds]) => {
      const regular = profileData || []
      setProfiles(regular)
      // Find one admirer not already in the deck
      const deckIds = new Set(regular.map(p => p.user_id))
      const freshAdmirerId = admireIds.find(id => !deckIds.has(id))
      if (freshAdmirerId) {
        const { data: ap } = await bb.from('profiles').select('*').eq('user_id', freshAdmirerId).limit(1)
        setAdmirer({ userId: freshAdmirerId, profile: ap?.[0] || null })
      }
      setLoading(false)
    })
  }, [user.id])

  const decide = useCallback(async (direction) => {
    if (isDeciding.current || indexRef.current >= profiles.length) return
    isDeciding.current = true
    playSwipe(direction)
    setExiting(direction)

    const profile = profiles[indexRef.current]

    setTimeout(async () => {
      await recordSwipe(user.id, profile.user_id, direction === 'right' ? 'like' : 'pass')

      if (direction === 'right') {
        const mutual = await checkMutualLike(user.id, profile.user_id)
        if (mutual) {
          await createMatch(user.id, profile.user_id)
          onMatch?.(profile)
          if (admirer?.userId === profile.user_id) setAdmirer(null)
        }
      }
      // Swiped past the admirer without a match — clear teaser
      if (admirer?.userId === profile.user_id) setAdmirer(null)

      indexRef.current += 1
      setIndex(i => i + 1)
      setOffset({ x: 0, y: 0 })
      setExiting(null)
      isDeciding.current = false
      dragStart.current = null
    }, 380)
  }, [profiles, user.id, onMatch, playSwipe])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight') decide('right')
      if (e.key === 'ArrowLeft') decide('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decide])

  const onPointerDown = e => {
    if (isDeciding.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
  }
  const onPointerMove = e => {
    if (!dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }
  const onPointerUp = () => {
    if (!dragStart.current) return
    if (offset.x > 80) decide('right')
    else if (offset.x < -80) decide('left')
    else { setOffset({ x: 0, y: 0 }); setDragging(false) }
    dragStart.current = null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f', paddingBottom: 80 }}>
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (profiles.length === 0 || index >= profiles.length) {
    const isEmpty = profiles.length === 0
    const inviteText = `I just found out I'm The ${user?.email?.split('@')[0] || 'Explorer'} on Polymath — what are you? 60-second test → ${window.location.origin}`
    const handleInvite = () => {
      if (navigator.share) {
        navigator.share({ title: 'Join me on Polymath', text: inviteText, url: window.location.origin }).catch(() => {})
      } else {
        navigator.clipboard.writeText(window.location.origin).catch(() => {})
      }
    }

    // Daily discovery card — date-seeded from un-liked cards
    const myLikedIdsEmpty = new Set(myProfile?.liked_card_ids || [])
    const unlikedCards = CARDS.filter(c => !myLikedIdsEmpty.has(c.id))
    const todayKey = new Date().toDateString()
    const seedNum = [...todayKey].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const todayCard = unlikedCards.length > 0 ? unlikedCards[seedNum % unlikedCards.length] : null
    const dailyDoneKey = `polymath_daily_${todayKey}`
    const [dailyAdded, setDailyAdded] = useState(() => !!localStorage.getItem(dailyDoneKey))

    const handleAddDailyCard = async () => {
      if (!todayCard || dailyAdded) return
      const newIds = [...(myProfile?.liked_card_ids || []), todayCard.id]
      await updateProfile(user.id, { liked_card_ids: newIds })
      localStorage.setItem(dailyDoneKey, '1')
      setDailyAdded(true)
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#0a0a0f', paddingBottom: 80 }}>
        <div className="text-5xl mb-4">🌌</div>
        <h2 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
          {isEmpty ? "You're one of the first here." : "You've seen everyone."}
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 260 }}>
          {isEmpty
            ? "The people who join now will define this community."
            : "Invite friends — new matches appear when they join."}
        </p>
        <button
          onClick={handleInvite}
          className="px-6 py-3 rounded-2xl font-bold text-sm mb-8 transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}>
          {isEmpty ? '✨ Invite friends & unlock matches' : '🔗 Invite more people'}
        </button>

        {todayCard && (
          <div className="w-full max-w-xs">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Today's discovery</p>
            <div className="rounded-2xl p-5 text-center mb-3"
              style={{ background: `${CATEGORY_COLORS[todayCard.category]}0d`, border: `1px solid ${CATEGORY_COLORS[todayCard.category]}30` }}>
              <div className="text-4xl mb-2">{todayCard.emoji}</div>
              <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif' }}>{todayCard.label}</p>
              <p className="text-xs mb-3" style={{ color: CATEGORY_COLORS[todayCard.category] }}>{CATEGORY_LABELS[todayCard.category]}</p>
              <button
                onClick={handleAddDailyCard}
                disabled={dailyAdded}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: dailyAdded ? 'rgba(16,185,129,0.12)' : `${CATEGORY_COLORS[todayCard.category]}20`,
                  color: dailyAdded ? '#10b981' : CATEGORY_COLORS[todayCard.category],
                  border: `1px solid ${dailyAdded ? 'rgba(16,185,129,0.35)' : `${CATEGORY_COLORS[todayCard.category]}40`}`,
                }}>
                {dailyAdded ? '✓ Added to your profile' : '+ Add to my profile'}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Come back tomorrow for a new one.</p>
          </div>
        )}
      </div>
    )
  }

  const profile = profiles[index]
  const nextProfile = profiles[index + 1]
  const scores = profile.category_scores || {}
  const compat = compatibilityScore(myProfile?.category_scores, scores)
  const archName = ALL_ARCHETYPES.find(a => a.id === profile.archetype_id)
  const likedCards = (profile.liked_card_ids || []).map(id => CARDS.find(c => c.id === id)).filter(Boolean)
  const top5 = likedCards.slice(0, 5)
  const myLikedIds = new Set(myProfile?.liked_card_ids || [])
  const sharedCards = likedCards.filter(c => myLikedIds.has(c.id)).slice(0, 3)

  const rotation = offset.x * 0.1
  const swipeDir = offset.x > 50 ? 'right' : offset.x < -50 ? 'left' : null
  const rightOpacity = Math.min(1, Math.max(0, offset.x / 90))
  const leftOpacity = Math.min(1, Math.max(0, -offset.x / 90))

  let cardTransform = `translateX(${offset.x}px) translateY(${offset.y * 0.2}px) rotate(${rotation}deg)`
  let cardTransition = dragging ? 'none' : 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
  if (exiting === 'right') { cardTransform = 'translateX(150vw) rotate(30deg)'; cardTransition = 'transform 0.38s ease-in' }
  if (exiting === 'left')  { cardTransform = 'translateX(-150vw) rotate(-30deg)'; cardTransition = 'transform 0.38s ease-in' }

  const glowColor = swipeDir === 'right'
    ? '0 0 70px rgba(251,191,36,0.4), 0 30px 80px rgba(0,0,0,0.6)'
    : swipeDir === 'left'
    ? '0 0 70px rgba(59,130,246,0.4), 0 30px 80px rgba(0,0,0,0.6)'
    : '0 30px 80px rgba(0,0,0,0.6)'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center select-none"
      style={{ background: '#0a0a0f', paddingBottom: 96 }}>
      <div className="w-full max-w-xs px-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>discover</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{profiles.length - index} left</span>
        </div>
        {admirer && (
          <div className="mt-2 flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.2)', filter: 'blur(0px)' }}>
              👤
            </div>
            <p className="text-xs leading-tight flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>Someone</span> already likes your profile — keep swiping to find them
            </p>
          </div>
        )}
      </div>

      <div className="relative" style={{ width: 320, height: 480 }}>
        {nextProfile && (
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: 'linear-gradient(145deg,#181830,#141428)', transform: 'scale(0.93) translateY(16px)', border: '1px solid rgba(255,255,255,0.05)' }} />
        )}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#1c1c34,#161628)', border: '1px solid rgba(255,255,255,0.1)', transform: cardTransform, transition: cardTransition, boxShadow: glowColor, touchAction: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        >
          {/* Stamps */}
          <div className="absolute top-6 left-6 pointer-events-none z-10" style={{ opacity: rightOpacity, transform: 'rotate(-14deg)' }}>
            <div className="px-3 py-1 rounded-xl" style={{ border: '2.5px solid #fbbf24', background: 'rgba(251,191,36,0.12)' }}>
              <span className="font-black tracking-widest text-base" style={{ color: '#fbbf24' }}>CONNECT</span>
            </div>
          </div>
          <div className="absolute top-6 right-6 pointer-events-none z-10" style={{ opacity: leftOpacity, transform: 'rotate(14deg)' }}>
            <div className="px-3 py-1 rounded-xl" style={{ border: '2.5px solid #60a5fa', background: 'rgba(96,165,250,0.12)' }}>
              <span className="font-black tracking-widest text-base" style={{ color: '#60a5fa' }}>PASS</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center flex-1 px-6 pt-8 pb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {profile.avatar_emoji || archName?.emoji || '👤'}
            </div>

            {/* Name + archetype */}
            <p className="text-white font-bold text-xl mb-1 text-center" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
              {profile.display_name || 'Anonymous'}
            </p>
            <span className="px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
              {archName?.name || 'Explorer'}
            </span>

            {/* Top interests */}
            {top5.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                {top5.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: `${CATEGORY_COLORS[c.category]}12`, color: CATEGORY_COLORS[c.category], border: `1px solid ${CATEGORY_COLORS[c.category]}28` }}>
                    {c.emoji} {c.label}
                  </span>
                ))}
              </div>
            )}

            {/* Shared interests */}
            {sharedCards.length > 0 && (
              <div className="mb-3 w-full">
                <p className="text-center text-xs mb-1.5 font-medium" style={{ color: 'rgba(251,191,36,0.55)' }}>you both love</p>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {sharedCards.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(251,191,36,0.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.38)' }}>
                      {c.emoji} {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compatibility */}
            {compat > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <span className="text-xs font-bold" style={{ color: '#8b5cf6' }}>{compat}% compatible</span>
              </div>
            )}
          </div>

          <p className="text-center pb-4 text-xs pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
            ← drag or arrow keys →
          </p>
        </div>
      </div>

      <div className="flex gap-10 mt-8">
        <button onClick={() => decide('left')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1.5px solid rgba(96,165,250,0.35)' }}>
          <X size={26} color="#60a5fa" />
        </button>
        <button onClick={() => decide('right')}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1.5px solid rgba(251,191,36,0.35)' }}>
          <Heart size={26} color="#fbbf24" />
        </button>
      </div>
    </div>
  )
}

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────

function ChatScreen({ match, otherProfile, otherArch, myLikedCards, user, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [phase, setPhase] = useState(0)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const sharedIds = new Set(otherProfile?.liked_card_ids || [])
  const sharedCards = (myLikedCards || []).filter(c => sharedIds.has(c.id)).slice(0, 3)
  const icebreakers = sharedCards.map(c => `What got you into ${c.emoji} ${c.label}?`)
  if (icebreakers.length < 3) icebreakers.push("What's the most surprising thing you're into?", "What would you do with an extra hour every day?")

  const loadMessages = useCallback(async () => {
    const { data } = await getMessages(match.id)
    setMessages(data || [])
  }, [match.id])

  useEffect(() => {
    loadMessages()
    setTimeout(() => setPhase(1), 80)
    pollRef.current = setInterval(loadMessages, 5000)
    return () => clearInterval(pollRef.current)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content = text) => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    const optimistic = { id: Date.now(), sender_id: user.id, content: trimmed, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])
    await sendMessage(match.id, user.id, trimmed)
    setSending(false)
    await loadMessages()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0a0a0f', transform: phase ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <X size={18} color="rgba(255,255,255,0.6)" />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
          {otherProfile?.avatar_emoji || otherArch?.emoji || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{otherProfile?.display_name || 'Anonymous'}</p>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{otherArch?.name || 'Explorer'}</p>
        </div>
        {sharedCards.length > 0 && (
          <div className="flex gap-1">
            {sharedCards.map((c, i) => <span key={i} className="text-base">{c.emoji}</span>)}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Start with a question</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>or tap a suggestion below</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const mine = msg.sender_id === user.id
          return (
            <div key={msg.id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={mine
                  ? { background: 'rgba(251,191,36,0.18)', color: '#fde68a', borderBottomRightRadius: 6 }
                  : { background: 'rgba(139,92,246,0.18)', color: '#c4b5fd', borderBottomLeftRadius: 6 }}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Icebreaker chips */}
      {messages.length === 0 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {icebreakers.slice(0, 3).map((q, i) => (
            <button key={i} onClick={() => handleSend(q)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-8 pt-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-3 items-end">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Say something…"
            className="flex-1 px-4 py-3 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#fbbf24' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
            <ChevronRight size={20} color="#000" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MY MATCHES SCREEN ────────────────────────────────────────────────────────

function MyMatchesScreen({ user, myArchetype, myProfile }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchProfiles, setMatchProfiles] = useState({})
  const [activeChatMatch, setActiveChatMatch] = useState(null)

  useEffect(() => {
    getMyMatches(user.id).then(async ({ data }) => {
      setMatches(data || [])
      // Fetch other person's profile for each match
      const others = (data || []).map(m => m.user_a_id === user.id ? m.user_b_id : m.user_a_id)
      const fetched = {}
      await Promise.all(others.map(async uid => {
        const { data: pData } = await bb.from('profiles').select('*').eq('user_id', uid).limit(1)
        if (pData?.[0]) fetched[uid] = pData[0]
      }))
      setMatchProfiles(fetched)
      setLoading(false)
    })
  }, [user.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f', paddingBottom: 80 }}>
        <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0a0a0f', paddingBottom: 100 }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💜</div>
          <h1 className="text-white mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em' }}>
            My Matches
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {matches.length === 0 ? 'No matches yet — keep discovering' : `${matches.length} connection${matches.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌌</div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Your first match is out there.<br />Head to Discover and find them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match, i) => {
              const otherId = match.user_a_id === user.id ? match.user_b_id : match.user_a_id
              const other = matchProfiles[otherId]
              const otherArch = ALL_ARCHETYPES.find(a => a.id === other?.archetype_id)
              const compat = compatibilityScore(
                myProfile?.category_scores || myArchetype?.category_scores,
                other?.category_scores
              )
              return (
                <button key={i} onClick={() => setActiveChatMatch({ match, other, otherArch })}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: 'linear-gradient(145deg,#1a1428,#141428)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    {other?.avatar_emoji || otherArch?.emoji || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{other?.display_name || 'Anonymous'}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {otherArch?.name || 'Explorer'}{compat > 0 ? ` · ${compat}% match` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1.5 rounded-full"
                      style={{ background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)' }}>
                      Message →
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      {match.created_at ? timeAgo(match.created_at) : ''}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {activeChatMatch && (
        <ChatScreen
          match={activeChatMatch.match}
          otherProfile={activeChatMatch.other}
          otherArch={activeChatMatch.otherArch}
          myLikedCards={myProfile?.liked_card_ids?.map(id => CARDS.find(c => c.id === id)).filter(Boolean) || []}
          user={user}
          onClose={() => setActiveChatMatch(null)}
        />
      )}
    </div>
  )
}

// ─── WRAPPED CARD ─────────────────────────────────────────────────────────────

function WrappedCard({ archetype, liked, innerRef }) {
  const top5 = liked.slice(0, 5)
  return (
    <div ref={innerRef} style={{
      width: 300, height: 520, background: 'linear-gradient(145deg,#0a0a0f 0%,#1a1428 45%,#0a0a18 100%)',
      borderRadius: 28, padding: 28, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      fontFamily: 'system-ui,sans-serif',
    }}>
      <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(251,191,36,0.07)' }} />
      <div style={{ position:'absolute', bottom:-30, left:-40, width:150, height:150, borderRadius:'50%', background:'rgba(139,92,246,0.07)' }} />
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 60%)' }} />
      <div style={{ position:'relative', zIndex:1, textAlign:'center', width:'100%' }}>
        <div style={{ fontSize:52, marginBottom:6 }}>{archetype.emoji}</div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:4, color:'#fbbf24', textTransform:'uppercase', marginBottom:14 }}>
          Polymath · {archetype.rarityLabel}
        </div>
        <div style={{ fontSize:26, fontWeight:900, color:'white', marginBottom:8, lineHeight:1.2, letterSpacing:'-0.03em' }}>
          {archetype.name}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:28, lineHeight:1.6, padding:'0 8px' }}>
          {archetype.description}
        </div>
        {top5.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:28 }}>
            {top5.map((c, i) => <span key={i} style={{ fontSize:30 }}>{c.emoji}</span>)}
          </div>
        )}
        <div style={{ display:'inline-block', padding:'7px 18px', borderRadius:100, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.35)', color:'#fbbf24', fontSize:11, fontWeight:700, letterSpacing:1 }}>
          Top {archetype.rarity}% of curious minds
        </div>
        <div style={{ marginTop:24, fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:2 }}>POLYMATH.APP</div>
      </div>
    </div>
  )
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────

function ProfileScreen({ archetype, liked, recommendations, onRestart, user, scores: scoresProp, onSaved, onGoDiscover, streak, dbProfile, onProfileUpdated }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(dbProfile?.display_name || user?.email?.split('@')[0] || '')
  const [bio, setBio] = useState(dbProfile?.bio || '')
  const [savingBio, setSavingBio] = useState(false)
  const scores = scoresProp ?? computeScores(liked)
  const cardRef = useRef(null)

  const handleNameSave = async () => {
    setEditingName(false)
    if (!user || !displayName.trim()) return
    await updateProfile(user.id, { display_name: displayName.trim() })
    onProfileUpdated?.({ display_name: displayName.trim() })
  }

  const handleBioSave = async () => {
    if (!user) return
    setSavingBio(true)
    await updateProfile(user.id, { bio: bio.trim() })
    onProfileUpdated?.({ bio: bio.trim() })
    setSavingBio(false)
  }

  const shareUrl = getShareUrl(archetype, liked)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I'm ${archetype.name} on Polymath`,
          text: `${archetype.description} Discover your archetype →`,
          url: shareUrl,
        })
        return
      } catch {}
    }
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 })
      const a = document.createElement('a')
      a.download = `polymath-${archetype.id}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } catch {
      alert('Right-click the card below and select "Save Image As…"')
    }
    setDownloading(false)
  }

  const sections = recommendations ? REC_SECTIONS.map(s => ({ ...s, items: recommendations[s.key] })) : []

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0a0a0f' }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              {archetype.emoji} {archetype.rarityLabel}
            </div>
            {streak?.count > 0 && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                🔥 {streak.count}d
              </div>
            )}
          </div>
          <h1 className="text-white leading-tight"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.03em' }}>
            {archetype.name}
          </h1>
          <p className="mt-2 leading-relaxed text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{archetype.description}</p>

          {user && (
            <div className="mb-1">
              {editingName ? (
                <input
                  autoFocus
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  className="text-center text-sm font-semibold text-white outline-none rounded-xl px-3 py-1.5 w-full max-w-xs"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                  maxLength={40}
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="flex items-center justify-center gap-1.5 mx-auto text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {displayName || 'Add your name'} <span style={{ fontSize: 11, opacity: 0.5 }}>✏️</span>
                </button>
              )}
            </div>
          )}

          {user && (
            <div className="mx-auto" style={{ maxWidth: 280 }}>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 140))}
                onBlur={handleBioSave}
                placeholder="Add a line about yourself — 3× more matches"
                rows={2}
                className="w-full text-center text-xs leading-relaxed outline-none resize-none bg-transparent"
                style={{ color: 'rgba(255,255,255,0.35)', caretColor: '#fbbf24' }}
              />
              {bio.length > 0 && (
                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>{bio.length}/140</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-3xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <RadarChart scores={scores} size={280} />
        </div>

        {/* Archetype evolution progress bar */}
        <div className="rounded-2xl px-4 py-3 mb-7" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>Interests explored</span>
            <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>{liked.length}/50</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', height: 5 }}>
            <div className="h-full rounded-full"
              style={{ width: `${Math.min(100, (liked.length / 50) * 100)}%`, background: 'linear-gradient(90deg,#fbbf24,#f59e0b)', transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
          {liked.length < 25 && (
            <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              🔒 Your archetype deepens at 25 interests
            </p>
          )}
          {liked.length >= 25 && liked.length < 50 && (
            <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              ✨ Your archetype is evolving — keep going
            </p>
          )}
          {liked.length >= 50 && (
            <p className="text-xs mt-1.5" style={{ color: '#fbbf24' }}>
              🏆 All 50 interests explored — rare mind
            </p>
          )}
        </div>

        {liked.length > 0 && (
          <div className="mb-7">
            <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Fraunces, serif', color: 'rgba(255,255,255,0.85)' }}>My Interests</h2>
            <div className="flex flex-wrap gap-2">
              {liked.map(card => (
                <span key={card.id} className="px-3 py-1.5 rounded-full text-sm"
                  style={{ background: `${CATEGORY_COLORS[card.category]}12`, color: CATEGORY_COLORS[card.category], border: `1px solid ${CATEGORY_COLORS[card.category]}28` }}>
                  {card.emoji} {card.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {sections.map(section => section.items?.length > 0 && (
          <div key={section.key} className="mb-7">
            <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Fraunces, serif', color: section.color }}>{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="rounded-2xl p-3.5 flex items-start gap-3"
                  style={{ background: `${section.color}08`, border: `1px solid ${section.color}18` }}>
                  <span className="text-xl leading-none mt-0.5">{item.emoji}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Share actions */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button onClick={handleShare}
            className="py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24' }}>
            <Share2 size={14} /> Share
          </button>
          <button onClick={handleCopy}
            className="py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', border: copied ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.1)', color: copied ? '#10b981' : 'rgba(255,255,255,0.65)' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={handleDownload}
            className="py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}>
            <Download size={14} />
            {downloading ? 'Saving…' : 'Save Card'}
          </button>
        </div>

        <button onClick={onRestart}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-10 transition-all duration-200 hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <RefreshCw size={14} /> Start over
        </button>

        {/* Auth / Matching CTA */}
        <MatchingCTASection
          user={user}
          archetype={archetype}
          liked={liked}
          scores={scores}
          recommendations={recommendations}
          onSaved={onSaved}
          onGoDiscover={onGoDiscover}
        />

        {/* Wrapped card */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Fraunces, serif', color: 'rgba(255,255,255,0.7)' }}>
            Your Wrapped Card
          </h2>
          <div className="flex justify-center">
            <WrappedCard archetype={archetype} liked={liked} innerRef={cardRef} />
          </div>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Tap "Save Card" above to download as PNG
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [saved, setSaved] = useState(null)
  const [liked, setLiked] = useState([])
  const [archetype, setArchetype] = useState(null)
  const [recommendations, setRecommendations] = useState(null)

  // Auth + social state
  const [user, setUser] = useState(null)
  const [dbProfile, setDbProfile] = useState(null)
  const [tab, setTab] = useState('profile') // 'profile' | 'discover' | 'matches'
  const [matchData, setMatchData] = useState(null) // { myArchetype, theirProfile }
  const [matchCount, setMatchCount] = useState(0)
  const [streak, setStreak] = useState(() => loadStreak())

  // Restore auth session and listen for changes; handle OAuth redirect recovery
  useEffect(() => {
    const session = getSession()
    const currentUser = session?.user ?? null
    if (currentUser) setUser(currentUser)

    const unsub = onAuthStateChange(({ session: s }) => {
      const u = s?.user ?? null
      setUser(u)
      if (u) {
        getMyProfile(u.id).then(({ data }) => {
          if (data?.[0]) setDbProfile(data[0])
        })
        // OAuth redirect recovery: restore pending quick-onboard
        const raw = localStorage.getItem('polymath_quick')
        if (raw) {
          try {
            const { likedIds } = JSON.parse(raw)
            const pendingLiked = likedIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean)
            const arch = computeArchetype(pendingLiked)
            const sc = computeScores(pendingLiked)
            localStorage.removeItem('polymath_quick')
            setLiked(pendingLiked)
            setArchetype(arch)
            saveProfile(u.id, { archetype: arch, liked: pendingLiked, scores: sc, recommendations: null, displayName: u.email?.split('@')[0] || 'Explorer' })
              .then(() => getMyProfile(u.id).then(({ data }) => { if (data?.[0]) setDbProfile(data[0]) }))
            setScreen('archetype')
          } catch {}
        }
      } else {
        setDbProfile(null)
      }
    })
    return () => unsub?.()
  }, [])

  // Keep match badge count fresh
  useEffect(() => {
    if (!user) return
    getMyMatches(user.id).then(({ data }) => setMatchCount((data || []).length))
  }, [user, matchData])

  // Check localStorage on mount; if OAuth just returned with a session,
  // the onAuthStateChange handler above handles the redirect recovery.
  // Otherwise, set initial screen normally.
  useEffect(() => {
    const session = getSession()
    const quickRaw = localStorage.getItem('polymath_quick')
    if (quickRaw && session?.user) {
      // Already handled by onAuthStateChange — just wait (screen stays 'loading')
      return
    }
    setStreak(updateStreak())
    const data = loadState()
    if (data) {
      setSaved(data)
      setScreen('returning')
    } else {
      setScreen('swipe')
    }
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [screen, tab])

  const handleQuickSwipeComplete = useCallback(likedCards => {
    setLiked(likedCards)
    setArchetype(computeArchetype(likedCards))
    setScreen('alien-proposal')
  }, [])

  const handleSwipeComplete = useCallback(likedCards => {
    setLiked(likedCards)
    setArchetype(computeArchetype(likedCards))
    setScreen('archetype')
  }, [])

  const handleAlienSignedUp = useCallback((newUser) => {
    setUser(newUser)
    getMyProfile(newUser.id).then(({ data }) => { if (data?.[0]) setDbProfile(data[0]) })
    setScreen('archetype')
  }, [])

  const handleAlienSkip = useCallback(() => {
    // Continue the full 50-card flow from where they left off
    setScreen('swipe-continue')
  }, [])

  const handleMatchesComplete = () => {
    saveState(archetype, liked, recommendations)
    setScreen('profile')
  }

  const handleRestart = () => {
    localStorage.removeItem('polymath_v1')
    setLiked([]); setArchetype(null); setRecommendations(null); setSaved(null)
    setScreen('swipe')
  }

  const handleProfileSaved = (profile) => {
    setDbProfile(profile)
    setTab('discover')
  }

  const scores = archetype ? computeScores(liked) : null

  if (screen === 'loading') return null

  const showSocialUI = screen === 'profile' && archetype && user

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingBottom: showSocialUI ? 72 : 0 }}>
      {screen === 'returning' && saved && (
        <ReturningUserScreen
          saved={saved}
          onContinue={() => { setLiked(saved.liked); setArchetype(saved.archetype); setRecommendations(saved.recommendations); setScreen('profile') }}
          onRestart={handleRestart}
        />
      )}
      {screen === 'swipe' && (
        <SwipeScreen
          onComplete={handleSwipeComplete}
          onQuickComplete={handleQuickSwipeComplete}
        />
      )}
      {screen === 'swipe-continue' && (
        <SwipeScreen
          onComplete={handleSwipeComplete}
          startIndex={QUICK_LIMIT}
          initialLiked={liked}
        />
      )}
      {screen === 'alien-proposal' && archetype && (
        <AlienProposalScreen
          liked={liked}
          archetype={archetype}
          scores={scores}
          recommendations={recommendations}
          onSignedUp={handleAlienSignedUp}
          onSkip={handleAlienSkip}
        />
      )}
      {screen === 'archetype' && archetype && (
        <ArchetypeScreen archetype={archetype} liked={liked} onNext={() => setScreen('recommendations')} />
      )}
      {screen === 'recommendations' && (
        <RecommendationsScreen liked={liked} onNext={data => { setRecommendations(data); setScreen('matches') }} />
      )}
      {screen === 'matches' && (
        <MatchesScreen archetype={archetype} onNext={handleMatchesComplete} />
      )}
      {screen === 'profile' && archetype && (
        <>
          {tab === 'profile' && (
            <ProfileScreen
              archetype={archetype}
              liked={liked}
              recommendations={recommendations}
              onRestart={handleRestart}
              user={user}
              scores={scores}
              streak={streak}
              onSaved={handleProfileSaved}
              onGoDiscover={() => setTab('discover')}
              dbProfile={dbProfile}
              onProfileUpdated={fields => setDbProfile(prev => ({ ...prev, ...fields }))}
            />
          )}
          {tab === 'discover' && user && (
            <DiscoverScreen
              user={user}
              myProfile={dbProfile}
              myArchetype={archetype}
              onMatch={(theirProfile) => setMatchData({ myArchetype: archetype, theirProfile })}
            />
          )}
          {tab === 'matches' && user && (
            <MyMatchesScreen user={user} myArchetype={archetype} myProfile={dbProfile} />
          )}
          {user && (
            <BottomNav tab={tab} onTab={setTab} matchCount={matchCount} />
          )}
        </>
      )}

      {matchData && (
        <MatchModal
          myArchetype={matchData.myArchetype}
          myLikedCards={liked}
          theirProfile={matchData.theirProfile}
          onClose={() => setMatchData(null)}
          onDiscover={() => { setMatchData(null); setTab('matches') }}
        />
      )}
    </div>
  )
}
