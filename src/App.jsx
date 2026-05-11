import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, X, ChevronRight, Download, Copy, Check, RefreshCw, Share2, Zap } from 'lucide-react'

// ─── CARD DATA (50 cards) ─────────────────────────────────────────────────────

const CARDS = [
  { id: 1,  emoji: '🏃', label: 'Running',          category: 'physical'    },
  { id: 2,  emoji: '🎸', label: 'Guitar',            category: 'music'       },
  { id: 3,  emoji: '🧠', label: 'Philosophy',        category: 'mind'        },
  { id: 4,  emoji: '✈️', label: 'Solo Travel',       category: 'exploration' },
  { id: 5,  emoji: '🍳', label: 'Cooking',           category: 'culinary'    },
  { id: 6,  emoji: '🧘', label: 'Meditation',        category: 'spiritual'   },
  { id: 7,  emoji: '🧗', label: 'Climbing',          category: 'physical'    },
  { id: 8,  emoji: '✍️', label: 'Writing',           category: 'creative'    },
  { id: 9,  emoji: '🍷', label: 'Wine & Food',       category: 'culinary'    },
  { id: 10, emoji: '🎉', label: 'Hosting',           category: 'social'      },
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
  // — new cards —
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

function SwipeScreen({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState([])
  const [exiting, setExiting] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const indexRef = useRef(0)
  const likedRef = useRef([])
  const isDeciding = useRef(false)
  const dragStart = useRef(null)
  const playSwipe = useSwipeSound()

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

      if (newIndex >= CARDS.length) onComplete(newLiked)
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
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{index}/{CARDS.length}</span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(index / CARDS.length) * 100}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
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

      <div className="flex gap-10 mt-10">
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
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
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
            {usingFallback ? 'Demo recommendations' : 'AI-curated for your profile'}
          </p>
          {usingFallback && !loading && (
            <div className="mt-3">
              {showKeyInput ? (
                <form onSubmit={e => { e.preventDefault(); setShowKeyInput(false); hasFetched.current = false; fetchRecs(apiKey) }} className="flex gap-2">
                  <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-ant-…" autoFocus
                    className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }} />
                  <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>Go</button>
                </form>
              ) : (
                <button onClick={() => setShowKeyInput(true)}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{ color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)' }}>
                  + Add API key for real AI
                </button>
              )}
            </div>
          )}
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

// ─── WAITLIST SECTION ─────────────────────────────────────────────────────────

function WaitlistSection({ archetype }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(() =>
    localStorage.getItem('polymath_waitlist') ? 'done' : 'idle'
  )

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      // Swap in your Formspree / Mailchimp / Supabase endpoint here
      await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, archetype: archetype.name }),
      })
    } catch {}
    localStorage.setItem('polymath_waitlist', email)
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="rounded-3xl p-8 text-center mb-8"
        style={{ background: 'linear-gradient(145deg,rgba(16,185,129,0.08),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="text-3xl mb-3">✅</div>
        <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
          You're on the list
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          We'll reach you the moment real matching goes live.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 mb-8"
      style={{ background: 'linear-gradient(145deg,#1a1428,#120e20)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Zap size={16} color="#8b5cf6" />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>
          Coming soon
        </span>
      </div>
      <h3 className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
        Match with real people
      </h3>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Swipe on real profiles. Find your intellectual soulmates. Be first when it launches.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? 'Joining…' : 'Claim My Spot →'}
        </button>
      </form>
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

function ProfileScreen({ archetype, liked, recommendations, onRestart }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const scores = computeScores(liked)
  const cardRef = useRef(null)

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            {archetype.emoji} {archetype.rarityLabel}
          </div>
          <h1 className="text-white leading-tight"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.03em' }}>
            {archetype.name}
          </h1>
          <p className="mt-2 leading-relaxed text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{archetype.description}</p>
        </div>

        <div className="rounded-3xl p-4 mb-7" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <RadarChart scores={scores} size={280} />
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

        {/* Waitlist */}
        <WaitlistSection archetype={archetype} />

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

  // Check localStorage on mount
  useEffect(() => {
    const data = loadState()
    if (data) {
      setSaved(data)
      setScreen('returning')
    } else {
      setScreen('swipe')
    }
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [screen])

  const handleSwipeComplete = useCallback(likedCards => {
    setLiked(likedCards)
    setArchetype(computeArchetype(likedCards))
    setScreen('archetype')
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

  if (screen === 'loading') return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {screen === 'returning' && saved && (
        <ReturningUserScreen
          saved={saved}
          onContinue={() => { setLiked(saved.liked); setArchetype(saved.archetype); setRecommendations(saved.recommendations); setScreen('profile') }}
          onRestart={handleRestart}
        />
      )}
      {screen === 'swipe' && <SwipeScreen onComplete={handleSwipeComplete} />}
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
        <ProfileScreen archetype={archetype} liked={liked} recommendations={recommendations} onRestart={handleRestart} />
      )}
    </div>
  )
}
