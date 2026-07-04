import { useState, useEffect } from 'react'
import { CATEGORIES, CATEGORY_LABELS } from '../data/categories.js'

// ─── RADAR CHART ──────────────────────────────────────────────────────────────

export function RadarChart({ scores, size = 280, animate = false }) {
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
      <polygon points={dataPts} fill="rgba(253,41,123,0.18)" stroke="#fd297b" strokeWidth="2"
        style={{ transition: drawn ? 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }} />
      {CATEGORIES.map((cat, i) => {
        const val = scores[cat] || 0
        const r = drawn ? (Math.min(val, 8) / 8) * maxR : 0
        const p = toXY(i, r)
        return <circle key={cat} cx={p.x} cy={p.y} r={val > 0 ? 4 : 2}
          fill={val > 0 ? '#fd297b' : 'rgba(255,255,255,0.2)'}
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
