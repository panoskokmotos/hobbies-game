import { useState } from 'react'
import {
  signUp, signIn, signInWithGoogle, signInWithApple, sendMagicLink,
  saveProfile, getMyProfile,
} from '../lib/api.js'
import { setPendingQuickOnboard, clearPendingQuickOnboard } from '../lib/storage.js'

// Consolidates the auth logic that used to be duplicated between
// AlienProposalScreen and MatchingCTASection: email/password state, social
// auth, magic link, and profile-save-on-signup. Both callers render their own
// chrome around <AuthForm>, which owns the actual form markup.
//
// `liked`/`archetype`/`scores`/`recommendations` are the swipe-session data to
// persist once a user signs up or in. Because OAuth redirects the page away
// and email confirmation waits on an external step, this data can't just live
// in React state across either gap — setPendingQuickOnboard bridges both,
// and is consumed once by the root Router's onAuthStateChange handler.
export function useAuthForm({ liked, archetype, scores, recommendations, onSignedUp }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // 'google' | 'apple'
  const [error, setError] = useState(null)

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider)
    setError(null)
    setPendingQuickOnboard(liked.map(c => c.id))
    const { error: authErr } = provider === 'google' ? await signInWithGoogle() : await signInWithApple()
    if (authErr) {
      setError('Could not open sign-in. Try email instead.')
      clearPendingQuickOnboard()
    }
    setSocialLoading(null)
  }

  // Returns { confirmationRequired } on success, or null on failure (error state is set).
  const handleEmailSignUp = async (e, { displayName, avatarEmoji } = {}) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error: authErr } = await signUp({ name, email, password })
      if (authErr) { setError(authErr.message || 'Sign up failed'); setLoading(false); return null }
      const userId = data?.user?.id
      if (userId) {
        await saveProfile(userId, {
          archetype, liked, scores, recommendations,
          displayName: displayName ?? name, avatarEmoji,
        })
        setLoading(false)
        onSignedUp?.(data.user)
        return { confirmationRequired: false }
      }
      // Email confirmation required: swipe data can't be saved yet (no userId),
      // so bridge it the same way an OAuth redirect would.
      setPendingQuickOnboard(liked.map(c => c.id))
      setLoading(false)
      return { confirmationRequired: true }
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
      return null
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error: authErr } = await signIn({ email, password })
      if (authErr) { setError(authErr.message || 'Sign in failed'); setLoading(false); return null }
      const userId = data?.user?.id
      if (!userId) { setError('Sign in failed — please check your credentials.'); setLoading(false); return null }
      const { data: existing } = await getMyProfile(userId)
      if (!existing?.[0]) {
        await saveProfile(userId, { archetype, liked, scores, recommendations, displayName: name || email.split('@')[0] })
      }
      setLoading(false)
      onSignedUp?.(data.user)
      return { confirmationRequired: false }
    } catch (err) {
      setError(err.message || 'Sign in failed')
      setLoading(false)
      return null
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) return null
    setLoading(true); setError(null)
    const { error: authErr } = await sendMagicLink({ email })
    setLoading(false)
    if (authErr) { setError('Could not send link. Try email sign-up instead.'); return null }
    return { sent: true }
  }

  return {
    name, setName, email, setEmail, password, setPassword, showPw, setShowPw,
    loading, error, setError, socialLoading,
    handleSocialAuth, handleEmailSignUp, handleSignIn, handleMagicLink,
  }
}
