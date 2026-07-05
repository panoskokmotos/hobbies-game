import { useState, useRef } from 'react'
import { Download, Copy, Check, RefreshCw, Share2, Zap, LogOut, ChevronLeft } from 'lucide-react'
import { REC_SECTIONS } from '../data/fallbackRecs.js'
import { BADGES } from '../data/badges.js'
import { CATEGORY_COLORS } from '../data/categories.js'
import { computeScores, getShareUrl } from '../lib/helpers.js'
import { updateProfile } from '../lib/api.js'
import { subscribeToPush } from '../lib/push.js'
import { useAuthForm } from '../hooks/useAuthForm.js'
import { AuthForm } from '../components/auth/AuthForm.jsx'
import { RadarChart } from '../components/RadarChart.jsx'
import { WrappedCard } from '../components/WrappedCard.jsx'
import { BG, TEXT, text } from '../lib/theme.js'

// ─── PROFILE AUTH CTA (formerly the standalone MatchingCTASection) ───────────

function ProfileAuthCTA({ user, archetype, liked, scores, recommendations, onSaved, onGoDiscover }) {
  const [view, setView] = useState('entry') // entry | signup | signin
  const [saved, setSaved] = useState(false)
  const auth = useAuthForm({
    liked, archetype, scores, recommendations,
    onSignedUp: (u) => { setSaved(true); onSaved?.(u) },
  })

  const handleSubmitSignUp = (e) => auth.handleEmailSignUp(e, { displayName: auth.name })
  const handleSubmitSignIn = (e) => auth.handleSignIn(e)

  if (user) {
    return (
      <div className="rounded-3xl p-6 mb-8 text-center"
        style={{ background: 'linear-gradient(145deg,rgba(16,185,129,0.08),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="text-3xl mb-3">✅</div>
        <p className="font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif', color: TEXT }}>Profile saved</p>
        <p className="text-sm mb-4" style={{ color: text(0.4) }}>You're in. Start discovering people like you.</p>
        <button onClick={onGoDiscover}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)', color: 'white' }}>
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
        <p className="font-bold text-lg mb-1" style={{ fontFamily: 'Fraunces, serif', color: TEXT }}>You're in</p>
        <p className="text-sm mb-4" style={{ color: text(0.4) }}>Profile saved. Start meeting your people.</p>
        <button onClick={onGoDiscover}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)', color: 'white' }}>
          Discover People →
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 mb-8"
      style={{ background: 'linear-gradient(145deg,rgba(253,41,123,0.08),rgba(253,41,123,0.03))', border: '1px solid rgba(253,41,123,0.25)' }}>
      {view === 'entry' ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} color="#fd297b" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fd297b' }}>Now live</span>
          </div>
          <h3 className="font-bold text-xl mb-1" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em', color: TEXT }}>
            Meet real people
          </h3>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: text(0.45) }}>
            Swipe on real profiles matched to your archetype. Find your intellectual soulmates.
          </p>
        </>
      ) : (
        <>
          <button onClick={() => setView('entry')} className="text-xs mb-4 transition-opacity hover:opacity-70"
            style={{ color: text(0.3) }}>← back</button>
          <h3 className="font-bold text-xl mb-4" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em', color: TEXT }}>
            {view === 'signup' ? 'Create your account' : 'Welcome back'}
          </h3>
        </>
      )}
      <AuthForm
        auth={auth}
        view={view}
        onChangeView={setView}
        onSubmitSignUp={handleSubmitSignUp}
        onSubmitSignIn={handleSubmitSignIn}
        showSignInLink
        submitLabel="Save Profile & Continue →"
      />
    </div>
  )
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────

export function ProfileScreen({ archetype, liked, recommendations, onRestart, onBack, user, scores: scoresProp, onSaved, onGoDiscover, streak, dbProfile, onProfileUpdated, matchCount, onLogout }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(dbProfile?.display_name || user?.email?.split('@')[0] || '')
  const [bio, setBio] = useState(dbProfile?.bio || '')
  const [pushGranted, setPushGranted] = useState(() => !!dbProfile?.push_subscription)
  const [pushPending, setPushPending] = useState(false)
  const scores = scoresProp ?? computeScores(liked)
  const cardRef = useRef(null)

  const requestPush = async () => {
    if (!user) return
    setPushPending(true)
    const { subscribed } = await subscribeToPush(user.id)
    setPushGranted(subscribed)
    setPushPending(false)
  }

  const badgeStats = { liked: liked.length, streak: streak?.count || 0, matches: matchCount || 0, hasBio: !!(dbProfile?.bio) }

  const handleNameSave = async () => {
    setEditingName(false)
    if (!user || !displayName.trim()) return
    await updateProfile(user.id, { display_name: displayName.trim() })
    onProfileUpdated?.({ display_name: displayName.trim() })
  }

  const handleBioSave = async () => {
    if (!user) return
    await updateProfile(user.id, { bio: bio.trim() })
    onProfileUpdated?.({ bio: bio.trim() })
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
    <div className="min-h-screen px-4 py-10" style={{ background: BG }}>
      <div className="max-w-sm mx-auto">
        {!user && onBack && (
          <button onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium mb-4 transition-opacity hover:opacity-70"
            style={{ color: text(0.4) }}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(253,41,123,0.12)', color: '#fd297b', border: '1px solid rgba(253,41,123,0.3)' }}>
              {archetype.emoji} {archetype.rarityLabel}
            </div>
            {streak?.count > 0 && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                🔥 {streak.count}d
              </div>
            )}
          </div>
          <h1 className="leading-tight"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.03em', color: TEXT }}>
            {archetype.name}
          </h1>
          <p className="mt-2 leading-relaxed text-sm mb-4" style={{ color: text(0.5) }}>{archetype.description}</p>

          {user && (
            <div className="mb-1">
              {editingName ? (
                <input
                  autoFocus
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  className="text-center text-sm font-semibold outline-none rounded-xl px-3 py-1.5 w-full max-w-xs"
                  style={{ background: text(0.08), border: `1px solid ${text(0.2)}`, color: TEXT }}
                  maxLength={40}
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="flex items-center justify-center gap-1.5 mx-auto text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: text(0.6) }}>
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
                style={{ color: text(0.35), caretColor: '#fd297b' }}
              />
              {bio.length > 0 && (
                <p className="text-center text-xs" style={{ color: text(0.18) }}>{bio.length}/140</p>
              )}
            </div>
          )}

          {user && onLogout && (
            <button onClick={onLogout}
              className="inline-flex items-center gap-1.5 mt-3 text-xs transition-opacity hover:opacity-70"
              style={{ color: text(0.3) }}>
              <LogOut size={12} /> Log out
            </button>
          )}
        </div>

        <div className="rounded-3xl p-4 mb-4" style={{ background: text(0.03), border: `1px solid ${text(0.06)}` }}>
          <RadarChart scores={scores} size={280} />
        </div>

        {/* Archetype evolution progress bar */}
        <div className="rounded-2xl px-4 py-3 mb-7" style={{ background: text(0.025), border: `1px solid ${text(0.06)}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: text(0.45) }}>Interests explored</span>
            <span className="text-xs font-semibold" style={{ color: '#fd297b' }}>{liked.length}/50</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ background: text(0.07), height: 5 }}>
            <div className="h-full rounded-full"
              style={{ width: `${Math.min(100, (liked.length / 50) * 100)}%`, background: 'linear-gradient(90deg,#fd297b,#ff655b)', transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
          {liked.length < 25 && (
            <p className="text-xs mt-1.5" style={{ color: text(0.25) }}>
              🔒 Your archetype deepens at 25 interests
            </p>
          )}
          {liked.length >= 25 && liked.length < 50 && (
            <p className="text-xs mt-1.5" style={{ color: text(0.25) }}>
              ✨ Your archetype is evolving — keep going
            </p>
          )}
          {liked.length >= 50 && (
            <p className="text-xs mt-1.5" style={{ color: '#fd297b' }}>
              🏆 All 50 interests explored — rare mind
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="mb-7">
          <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Fraunces, serif', color: text(0.85) }}>Badges</h2>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map(badge => {
              const earned = badge.check(badgeStats)
              return (
                <div key={badge.id} className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-center"
                  style={{
                    background: earned ? 'rgba(253,41,123,0.08)' : text(0.03),
                    border: earned ? '1px solid rgba(253,41,123,0.25)' : `1px solid ${text(0.07)}`,
                    opacity: earned ? 1 : 0.45,
                  }}>
                  <span className="text-2xl">{earned ? badge.emoji : '🔒'}</span>
                  <span className="text-xs font-semibold leading-tight" style={{ color: earned ? '#fd297b' : text(0.4), fontSize: 9 }}>{badge.name}</span>
                  {earned && <span className="text-xs" style={{ color: text(0.25), fontSize: 8 }}>{badge.desc}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Push notifications */}
        {user && !pushGranted && (
          <div className="rounded-2xl p-4 mb-7 flex items-center gap-4"
            style={{ background: 'rgba(253,41,123,0.07)', border: '1px solid rgba(253,41,123,0.2)' }}>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0.5" style={{ color: TEXT }}>Stay in the loop</p>
              <p className="text-xs" style={{ color: text(0.4) }}>Get notified when you match</p>
            </div>
            <button onClick={requestPush} disabled={pushPending}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] flex-shrink-0 disabled:opacity-60"
              style={{ background: 'rgba(253,41,123,0.2)', color: '#fd297b', border: '1px solid rgba(253,41,123,0.35)' }}>
              {pushPending ? 'Enabling…' : 'Enable'}
            </button>
          </div>
        )}

        {liked.length > 0 && (
          <div className="mb-7">
            <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Fraunces, serif', color: text(0.85) }}>My Interests</h2>
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
                    <p className="font-semibold text-sm" style={{ color: TEXT }}>{item.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: text(0.4) }}>{item.reason}</p>
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
            style={{ background: 'rgba(253,41,123,0.1)', border: '1px solid rgba(253,41,123,0.28)', color: '#fd297b' }}>
            <Share2 size={14} /> Share
          </button>
          <button onClick={handleCopy}
            className="py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: copied ? 'rgba(16,185,129,0.12)' : text(0.05), border: copied ? '1px solid rgba(16,185,129,0.35)' : `1px solid ${text(0.1)}`, color: copied ? '#10b981' : text(0.65) }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={handleDownload}
            className="py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: text(0.05), border: `1px solid ${text(0.1)}`, color: text(0.65) }}>
            <Download size={14} />
            {downloading ? 'Saving…' : 'Save Card'}
          </button>
        </div>

        <button onClick={onRestart}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-10 transition-all duration-200 hover:opacity-70"
          style={{ color: text(0.3), border: `1px solid ${text(0.08)}` }}>
          <RefreshCw size={14} /> Start over
        </button>

        {/* Auth / Matching CTA */}
        <ProfileAuthCTA
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
          <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Fraunces, serif', color: text(0.7) }}>
            Your Wrapped Card
          </h2>
          <div className="flex justify-center">
            <WrappedCard archetype={archetype} liked={liked} innerRef={cardRef} />
          </div>
          <p className="text-xs mt-3" style={{ color: text(0.2) }}>
            Tap "Save Card" above to download as PNG
          </p>
        </div>
      </div>
    </div>
  )
}
