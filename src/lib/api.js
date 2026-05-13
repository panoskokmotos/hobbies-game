import { bb } from './butterbase.js'

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const signUp = ({ name, email, password }) =>
  bb.auth.signUp({ email, password })

export const signIn = ({ email, password }) =>
  bb.auth.signIn({ email, password })

export const signOut = () => bb.auth.signOut()

export const getSession = () => bb.sessionManager.getSession()

export const onAuthStateChange = (cb) => bb.onAuthStateChange(cb)

// ─── PROFILES ─────────────────────────────────────────────────────────────────

export const saveProfile = (userId, { archetype, liked, scores, recommendations, displayName }) =>
  bb.from('profiles').insert({
    user_id: userId,
    archetype_id: archetype.id,
    liked_card_ids: liked.map(c => c.id),
    category_scores: scores,
    recommendations,
    display_name: displayName,
    avatar_emoji: archetype.emoji,
  })

export const getMyProfile = (userId) =>
  bb.from('profiles').select('*').eq('user_id', userId).limit(1)

export const getDiscoveryProfiles = async (myUserId, limit = 30) => {
  // Get IDs I've already swiped on so we can exclude them
  const { data: mySwipes } = await bb.from('swipes')
    .select('swiped_id')
    .eq('swiper_id', myUserId)

  const swipedIds = new Set((mySwipes || []).map(s => s.swiped_id))

  const { data, error } = await bb.from('profiles')
    .select('*')
    .neq('user_id', myUserId)
    .limit(limit)

  return {
    data: (data || []).filter(p => !swipedIds.has(p.user_id)),
    error,
  }
}

// ─── SWIPES ───────────────────────────────────────────────────────────────────

export const recordSwipe = (swiperId, swipedId, direction) =>
  bb.from('swipes').insert({ swiper_id: swiperId, swiped_id: swipedId, direction })

export const checkMutualLike = async (myUserId, theirUserId) => {
  const { data } = await bb.from('swipes')
    .select('direction')
    .eq('swiper_id', theirUserId)
    .eq('swiped_id', myUserId)
    .limit(1)
  return data?.[0]?.direction === 'like'
}

// ─── MATCHES ──────────────────────────────────────────────────────────────────

export const createMatch = (userAId, userBId) =>
  bb.from('matches').insert({ user_a_id: userAId, user_b_id: userBId })

export const getMyMatches = async (userId) => {
  const [{ data: asA }, { data: asB }] = await Promise.all([
    bb.from('matches').select('*').eq('user_a_id', userId),
    bb.from('matches').select('*').eq('user_b_id', userId),
  ])
  const all = [...(asA || []), ...(asB || [])]
  all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: all, error: null }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

export const compatibilityScore = (scoresA, scoresB) => {
  if (!scoresA || !scoresB) return 0
  let overlap = 0, total = 0
  Object.keys(scoresA).forEach(cat => {
    overlap += Math.min(scoresA[cat] || 0, scoresB[cat] || 0)
    total += Math.max(scoresA[cat] || 0, scoresB[cat] || 0)
  })
  return total > 0 ? Math.round((overlap / total) * 100) : 0
}
