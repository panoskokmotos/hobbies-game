import { bb } from './butterbase.js'
import { FALLBACK_RECS } from '../data/fallbackRecs.js'

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const signUp = async ({ name, email, password }) => {
  try {
    const result = await bb.auth.signUp({ email, password })
    return result
  } catch (err) {
    return { data: null, error: { message: err.message || 'Sign up failed' } }
  }
}

export const signIn = async ({ email, password }) => {
  try {
    const result = await bb.auth.signIn({ email, password })
    return result
  } catch (err) {
    return { data: null, error: { message: err.message || 'Sign in failed' } }
  }
}

// signInWithOAuth is synchronous and returns { url } directly — not a
// Promise, not the { data, error } shape every other auth function returns.
// The previous code awaited it and destructured { error }, which was always
// undefined, and never navigated to the returned url — so clicking
// "Continue with Google/Apple" silently did nothing. Also fixed: the params
// shape is flat ({ provider, redirectTo }), not { provider, options: { redirectTo } }.
const startOAuth = (provider) => {
  try {
    const { url } = bb.auth.signInWithOAuth({ provider, redirectTo: window.location.origin })
    if (!url) return { data: null, error: { message: `${provider} sign-in failed` } }
    window.location.href = url
    return { data: { url }, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || `${provider} sign-in failed` } }
  }
}

export const signInWithGoogle = () => startOAuth('google')

export const signInWithApple = () => startOAuth('apple')

export const sendMagicLink = async ({ email }) => {
  try {
    // sendMagicLink takes the email as a plain string, not { email }.
    await bb.auth.sendMagicLink?.(email)
    return { data: true, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not send magic link' } }
  }
}

export const signOut = async () => {
  try {
    return await bb.auth.signOut()
  } catch (err) {
    return { error: { message: err.message } }
  }
}

export const getSession = () => bb.sessionManager.getSession()

export const onAuthStateChange = (cb) => bb.onAuthStateChange(cb)

// ─── PROFILES ─────────────────────────────────────────────────────────────────

export const saveProfile = async (userId, { archetype, liked, scores, recommendations, displayName, avatarEmoji }) => {
  try {
    return await bb.from('profiles').insert({
      user_id: userId,
      archetype_id: archetype.id,
      liked_card_ids: liked.map(c => c.id),
      category_scores: scores,
      recommendations,
      display_name: displayName,
      avatar_emoji: avatarEmoji ?? archetype.emoji,
    })
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not save profile' } }
  }
}

export const getMyProfile = async (userId) => {
  try {
    return await bb.from('profiles').select('*').eq('user_id', userId).limit(1)
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not load profile' } }
  }
}

export const getProfileByUserId = async (userId) => {
  try {
    return await bb.from('profiles').select('*').eq('user_id', userId).limit(1)
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not load profile' } }
  }
}

export const updateProfile = async (userId, fields) => {
  try {
    return await bb.from('profiles').update(fields).eq('user_id', userId)
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not update profile' } }
  }
}

export const getDiscoveryProfiles = async (myUserId, limit = 30) => {
  try {
    // Get IDs I've already swiped on so we can exclude them
    const { data: mySwipes, error: swipeErr } = await bb.from('swipes')
      .select('swiped_id')
      .eq('swiper_id', myUserId)
    if (swipeErr) return { data: [], error: swipeErr }

    const swipedIds = new Set((mySwipes || []).map(s => s.swiped_id))

    const { data, error } = await bb.from('profiles')
      .select('*')
      .neq('user_id', myUserId)
      .limit(limit)
    if (error) return { data: [], error }

    return {
      data: (data || []).filter(p => !swipedIds.has(p.user_id)),
      error: null,
    }
  } catch (err) {
    return { data: [], error: { message: err.message || 'Could not load discovery profiles' } }
  }
}

// ─── SWIPES ───────────────────────────────────────────────────────────────────

export const recordSwipe = async (swiperId, swipedId, direction) => {
  try {
    return await bb.from('swipes').insert({ swiper_id: swiperId, swiped_id: swipedId, direction })
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not record swipe' } }
  }
}

export const undoSwipe = async (swiperId, swipedId) => {
  try {
    return await bb.from('swipes').delete().eq('swiper_id', swiperId).eq('swiped_id', swipedId)
  } catch (err) {
    return { error: { message: err.message || 'Could not undo swipe' } }
  }
}

const checkMutualLike = async (myUserId, theirUserId) => {
  const { data, error } = await bb.from('swipes')
    .select('direction')
    .eq('swiper_id', theirUserId)
    .eq('swiped_id', myUserId)
    .in('direction', ['like', 'superlike'])
    .limit(1)
  if (error) return { mutual: false, error }
  return { mutual: (data?.length ?? 0) > 0, error: null }
}

// ─── MATCHES ──────────────────────────────────────────────────────────────────

export const createMatchIfMutual = async (myUserId, theirUserId) => {
  try {
    const { mutual, error: checkErr } = await checkMutualLike(myUserId, theirUserId)
    if (checkErr) return { data: null, matched: false, error: checkErr }
    if (!mutual) return { data: null, matched: false, error: null }

    // Canonicalize row ordering so a concurrent mutual swipe from the other
    // side is at least detectable as an existing pair, narrowing (though not
    // fully closing without a DB-level unique constraint) the race window.
    const [userAId, userBId] = [myUserId, theirUserId].sort()
    const { data: existing } = await bb.from('matches')
      .select('*')
      .eq('user_a_id', userAId)
      .eq('user_b_id', userBId)
      .limit(1)
    if (existing?.[0]) return { data: existing[0], matched: true, error: null }

    const result = await bb.from('matches').insert({ user_a_id: userAId, user_b_id: userBId })
    return { data: result.data, matched: true, error: result.error }
  } catch (err) {
    return { data: null, matched: false, error: { message: err.message || 'Could not create match' } }
  }
}

export const undoMatch = async (matchId) => {
  try {
    return await bb.from('matches').delete().eq('id', matchId)
  } catch (err) {
    return { error: { message: err.message || 'Could not undo match' } }
  }
}

export const getMyMatches = async (userId) => {
  try {
    const [{ data: asA }, { data: asB }] = await Promise.all([
      bb.from('matches').select('*').eq('user_a_id', userId),
      bb.from('matches').select('*').eq('user_b_id', userId),
    ])
    const all = [...(asA || []), ...(asB || [])]
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { data: all, error: null }
  } catch (err) {
    return { data: [], error: { message: err.message || 'Could not load matches' } }
  }
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export const getMessages = async (matchId) => {
  try {
    return await bb.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true })
  } catch (err) {
    return { data: [], error: { message: err.message || 'Could not load messages' } }
  }
}

export const sendMessage = async (matchId, senderId, content) => {
  try {
    return await bb.from('messages').insert({ match_id: matchId, sender_id: senderId, content })
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not send message' } }
  }
}

// Marks every message the other person sent in this match as read by us —
// called whenever we view the chat, so their client shows "Seen" once it
// next polls. UpdateBuilder only supports .eq() filters (no .neq()), so this
// takes the other participant's id explicitly rather than "not me".
export const markMessagesRead = async (matchId, otherUserId) => {
  try {
    return await bb.from('messages').update({ read_at: new Date().toISOString() }).eq('match_id', matchId).eq('sender_id', otherUserId)
  } catch (err) {
    return { error: { message: err.message || 'Could not mark messages read' } }
  }
}

// ─── ADMIRERS ─────────────────────────────────────────────────────────────────

export const getAdmirers = async (myUserId) => {
  try {
    const { data: mySwipes, error: swipeErr } = await bb.from('swipes').select('swiped_id').eq('swiper_id', myUserId)
    if (swipeErr) return { data: [], error: swipeErr }
    const seen = new Set((mySwipes || []).map(s => s.swiped_id))

    const { data, error } = await bb.from('swipes').select('swiper_id').eq('swiped_id', myUserId).in('direction', ['like', 'superlike'])
    if (error) return { data: [], error }

    return { data: (data || []).filter(s => !seen.has(s.swiper_id)).map(s => s.swiper_id), error: null }
  } catch (err) {
    return { data: [], error: { message: err.message || 'Could not load admirers' } }
  }
}

export const getAdmirerProfiles = async (myUserId) => {
  try {
    const { data: admirerIds, error } = await getAdmirers(myUserId)
    if (error) return { data: [], error }
    const profiles = await Promise.all(admirerIds.map(async (id) => {
      const { data } = await getProfileByUserId(id)
      return data?.[0] || null
    }))
    return { data: profiles.filter(Boolean), error: null }
  } catch (err) {
    return { data: [], error: { message: err.message || 'Could not load admirer profiles' } }
  }
}

// ─── RECOMMENDATIONS ──────────────────────────────────────────────────────────
//
// There used to be a direct client-side call to api.anthropic.com here, using
// a VITE_ANTHROPIC_API_KEY env var. Vite inlines VITE_* vars into the shipped
// browser bundle, so that key was fully extractable by anyone via devtools —
// a live key-leak, not a style issue. Until a backend proxy exists (e.g. a
// Butterbase serverless function holding the key server-side), this always
// resolves to the curated fallback set. Do not reintroduce a client-side call
// to a paid LLM API with a VITE_-prefixed key.
export const getRecommendations = async (_interests) => {
  return { data: FALLBACK_RECS, usingFallback: true }
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
