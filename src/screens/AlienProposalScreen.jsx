import { useState, useEffect } from 'react'
import { CATEGORY_COLORS } from '../data/categories.js'
import { alienReaction } from '../lib/helpers.js'
import { useAuthForm } from '../hooks/useAuthForm.js'
import { AuthForm } from '../components/auth/AuthForm.jsx'
import { BG, TEXT, text } from '../lib/theme.js'

// ─── ALIEN PROPOSAL SCREEN ───────────────────────────────────────────────────

export function AlienProposalScreen({ liked, archetype, scores, recommendations, onSignedUp, onSkip }) {
  const [phase, setPhase] = useState(0)
  const [view, setView] = useState('entry') // entry | signup | magic
  const [emailConfirm, setEmailConfirm] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(archetype.emoji)

  const auth = useAuthForm({ liked, archetype, scores, recommendations, onSignedUp })

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 120)
    const t2 = setTimeout(() => setPhase(2), 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleSubmitSignUp = async (e) => {
    const result = await auth.handleEmailSignUp(e, { displayName: auth.name, avatarEmoji: selectedAvatar })
    if (result?.confirmationRequired) setEmailConfirm(true)
  }

  const handleSubmitMagic = async (e) => {
    const result = await auth.handleMagicLink(e)
    if (result?.sent) setMagicSent(true)
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <div className="w-full max-w-xs text-center">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em', color: TEXT }}>Check your inbox</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: text(0.45) }}>
            Magic link sent to <span style={{ color: '#fd297b' }}>{auth.email}</span>. Click it to jump straight in.
          </p>
          <button onClick={onSkip} className="text-xs transition-opacity hover:opacity-70" style={{ color: text(0.3) }}>
            Continue without account →
          </button>
        </div>
      </div>
    )
  }

  if (emailConfirm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <div className="w-full max-w-xs text-center">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em', color: TEXT }}>
            Check your inbox
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: text(0.45) }}>
            We sent a confirmation link to <span style={{ color: '#fd297b' }}>{auth.email}</span>. Click it and come back to explore.
          </p>
          <button onClick={onSkip}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: text(0.3) }}>
            Continue without account →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: BG }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 25%, rgba(253,41,123,0.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-xs relative z-10">
        {/* Alien + headline */}
        <div className="text-center mb-6"
          style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="text-7xl mb-2 animate-float" style={{ display: 'inline-block' }}>👽</div>
          <div className="text-3xl -mt-2 mb-4">💍</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#fd297b' }}>
            The alien has spoken
          </p>
          <h1 className="text-3xl font-bold leading-tight mb-2"
            style={{ fontFamily: 'Fraunces, serif', letterSpacing: '-0.03em', color: TEXT }}>
            {alienReaction(liked)}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: text(0.4) }}>
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
          <AuthForm
            auth={auth}
            view={view}
            onChangeView={setView}
            onSubmitSignUp={handleSubmitSignUp}
            onSubmitMagicLink={handleSubmitMagic}
            showMagicLinkOption
            showAvatarPicker
            selectedAvatar={selectedAvatar}
            onSelectAvatar={setSelectedAvatar}
            submitLabel="Join Polymath →"
          />
          <button onClick={onSkip}
            className="w-full text-xs mt-3 transition-opacity hover:opacity-70 text-center"
            style={{ color: text(0.25) }}>
            Skip for now — explore first →
          </button>
        </div>
      </div>
    </div>
  )
}
