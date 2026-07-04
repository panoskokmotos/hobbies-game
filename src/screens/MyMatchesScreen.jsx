import { useState, useEffect } from 'react'
import { CARDS } from '../data/cards.js'
import { ALL_ARCHETYPES } from '../data/archetypes.js'
import { getMyMatches, getProfileByUserId, compatibilityScore } from '../lib/api.js'
import { timeAgo } from '../lib/helpers.js'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ChatScreen } from './ChatScreen.jsx'

// ─── MY MATCHES SCREEN ────────────────────────────────────────────────────────

export function MyMatchesScreen({ user, myProfile }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchProfiles, setMatchProfiles] = useState({})
  const [activeChatMatch, setActiveChatMatch] = useState(null)
  const [seenMatchIds, setSeenMatchIds] = useState(() => new Set(JSON.parse(localStorage.getItem('polymath_seen_matches') || '[]')))

  useEffect(() => {
    let cancelled = false
    getMyMatches(user.id).then(async ({ data }) => {
      if (cancelled) return
      setMatches(data || [])
      // Fetch other person's profile for each match
      const others = (data || []).map(m => m.user_a_id === user.id ? m.user_b_id : m.user_a_id)
      const fetched = {}
      await Promise.all(others.map(async uid => {
        const { data: pData } = await getProfileByUserId(uid)
        if (pData?.[0]) fetched[uid] = pData[0]
      }))
      if (cancelled) return
      setMatchProfiles(fetched)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f', paddingBottom: 80 }}>
        <Spinner size={48} color="#a78bfa" />
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
              const compat = compatibilityScore(myProfile?.category_scores, other?.category_scores)
              return (
                <button key={i} onClick={() => {
                  setActiveChatMatch({ match, other, otherArch })
                  setSeenMatchIds(prev => {
                    const next = new Set([...prev, match.id])
                    try { localStorage.setItem('polymath_seen_matches', JSON.stringify([...next])) } catch {}
                    return next
                  })
                }}
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
                    <div className="flex items-center gap-1.5">
                      {!seenMatchIds.has(match.id) && (
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#8b5cf6', boxShadow: '0 0 6px rgba(139,92,246,0.7)' }} />
                      )}
                      <span className="text-xs font-bold px-2.5 py-1.5 rounded-full"
                        style={{ background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)' }}>
                        Message →
                      </span>
                    </div>
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
