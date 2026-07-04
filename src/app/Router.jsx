import { useState, useEffect, useCallback } from 'react'
import { CARDS } from '../data/cards.js'
import { computeArchetype, computeScores, decodeProfile } from '../lib/helpers.js'
import { loadState, saveState, loadStreak, updateStreak, consumePendingQuickOnboard, hasPendingQuickOnboard } from '../lib/storage.js'
import { BG } from '../lib/theme.js'
import {
  getSession, onAuthStateChange, signOut,
  getMyProfile, saveProfile, getMyMatches, getAdmirers,
} from '../lib/api.js'

const QUICK_LIMIT = 5

import { ReturningUserScreen } from '../screens/ReturningUserScreen.jsx'
import { SharedProfileScreen } from '../screens/SharedProfileScreen.jsx'
import { SwipeScreen } from '../screens/SwipeScreen.jsx'
import { AlienProposalScreen } from '../screens/AlienProposalScreen.jsx'
import { ArchetypeScreen } from '../screens/ArchetypeScreen.jsx'
import { RecommendationsScreen } from '../screens/RecommendationsScreen.jsx'
import { MatchesScreen } from '../screens/MatchesScreen.jsx'
import { ProfileScreen } from '../screens/ProfileScreen.jsx'
import { DiscoverScreen } from '../screens/DiscoverScreen.jsx'
import { LikesYouScreen } from '../screens/LikesYouScreen.jsx'
import { MyMatchesScreen } from '../screens/MyMatchesScreen.jsx'
import { BottomNav } from '../components/BottomNav.jsx'
import { MatchModal } from '../components/MatchModal.jsx'

export default function Router() {
  const [screen, setScreen] = useState('loading')
  const [saved, setSaved] = useState(null)
  const [liked, setLiked] = useState([])
  const [archetype, setArchetype] = useState(null)
  const [recommendations, setRecommendations] = useState(null)

  // Auth + social state
  const [user, setUser] = useState(null)
  const [dbProfile, setDbProfile] = useState(null)
  const [tab, setTab] = useState('profile') // 'profile' | 'discover' | 'likes' | 'matches'
  const [matchData, setMatchData] = useState(null) // { myArchetype, theirProfile }
  const [matchCount, setMatchCount] = useState(0)
  const [admirerCount, setAdmirerCount] = useState(0)
  const [streak, setStreak] = useState(() => loadStreak())
  const [sharedProfile, setSharedProfile] = useState(() => decodeProfile(window.location.search))

  // Restore auth session and listen for changes; handle OAuth/email-confirm redirect recovery.
  //
  // getSession() is synchronous (verified against the installed @butterbase/sdk —
  // Session | null with .user present directly), so no await is needed here.
  useEffect(() => {
    const session = getSession()
    const currentUser = session?.user ?? null
    if (currentUser) setUser(currentUser)

    // onAuthStateChange's callback signature is (event, session) — two
    // positional arguments, not a single { session } object. The previous
    // code destructured the first argument as `({ session: s }) => ...`,
    // which actually destructured the *event string* and left `s` (and so
    // `u`) always undefined — meaning OAuth sign-in never completed, since
    // the redirect-recovery block below is entirely gated on `if (u)`.
    const unsub = onAuthStateChange((event, s) => {
      const u = s?.user ?? null
      setUser(u)
      if (u) {
        getMyProfile(u.id).then(({ data }) => {
          if (data?.[0]) setDbProfile(data[0])
        })
        // OAuth/email-confirm redirect recovery: restore pending quick-onboard
        const likedIds = consumePendingQuickOnboard()
        if (likedIds) {
          const pendingLiked = likedIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean)
          const arch = computeArchetype(pendingLiked)
          const sc = computeScores(pendingLiked)
          setLiked(pendingLiked)
          setArchetype(arch)
          saveProfile(u.id, { archetype: arch, liked: pendingLiked, scores: sc, recommendations: null, displayName: u.email?.split('@')[0] || 'Explorer' })
            .then(() => getMyProfile(u.id).then(({ data }) => { if (data?.[0]) setDbProfile(data[0]) }))
          setScreen('archetype')
        }
      } else {
        setDbProfile(null)
      }
    })
    // onAuthStateChange returns a Subscription ({ unsubscribe: () => void }),
    // not a plain function — calling it directly throws on cleanup.
    return () => unsub?.unsubscribe?.()
  }, [])

  // Keep match + admirer badge counts fresh
  useEffect(() => {
    if (!user) return
    getMyMatches(user.id).then(({ data }) => setMatchCount((data || []).length))
    getAdmirers(user.id).then(({ data }) => setAdmirerCount((data || []).length))
  }, [user, matchData])

  // Check localStorage on mount; if OAuth/email-confirm just returned with a
  // session, the onAuthStateChange handler above handles the redirect
  // recovery. Otherwise, set the initial screen normally.
  useEffect(() => {
    if (sharedProfile) {
      setScreen('shared')
      return
    }
    const session = getSession()
    if (hasPendingQuickOnboard() && session?.user) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSharedContinue = useCallback(() => {
    setSharedProfile(null)
    // Drop the ?p= param so a refresh doesn't re-show the shared landing screen.
    window.history.replaceState({}, '', window.location.pathname)
    const data = loadState()
    if (data) { setSaved(data); setScreen('returning') } else { setScreen('swipe') }
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

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setDbProfile(null)
    setTab('profile')
  }

  const scores = archetype ? computeScores(liked) : null

  if (screen === 'loading') return null

  // The nav is now persistent chrome from the very first screen (not just
  // once signed in), so the app feels like a real app immediately rather
  // than a bare quiz. Before there's a real profile/matches to show, tabs
  // map to "where you conceptually are" but stay locked (visible for
  // orientation, not free navigation) — the linear onboarding flow itself
  // is unchanged, this is purely chrome + continuity.
  const isFullyOnboarded = screen === 'profile' && !!user
  const showNav = screen !== 'shared'
  const preSignupTab = screen === 'matches' ? 'matches'
    : screen === 'swipe' || screen === 'swipe-continue' ? 'discover'
    : 'profile'
  const effectiveTab = isFullyOnboarded ? tab : preSignupTab
  const lockedTabs = isFullyOnboarded ? [] : ['profile', 'discover', 'likes', 'matches'].filter(id => id !== effectiveTab)

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: showNav ? 72 : 0 }}>
      {screen === 'shared' && sharedProfile && (
        <SharedProfileScreen shared={sharedProfile} onContinue={handleSharedContinue} />
      )}
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
              matchCount={matchCount}
              onLogout={handleLogout}
            />
          )}
          {tab === 'discover' && user && (
            <DiscoverScreen
              user={user}
              myProfile={dbProfile}
              onMatch={(theirProfile) => setMatchData({ myArchetype: archetype, theirProfile })}
              onViewLikes={() => setTab('likes')}
            />
          )}
          {tab === 'likes' && user && (
            <LikesYouScreen
              user={user}
              myProfile={dbProfile}
              onMatch={(theirProfile) => setMatchData({ myArchetype: archetype, theirProfile })}
            />
          )}
          {tab === 'matches' && user && (
            <MyMatchesScreen user={user} myProfile={dbProfile} />
          )}
        </>
      )}

      {showNav && (
        <BottomNav
          tab={effectiveTab}
          onTab={isFullyOnboarded ? setTab : () => {}}
          matchCount={matchCount}
          admirerCount={admirerCount}
          lockedTabs={lockedTabs}
        />
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
