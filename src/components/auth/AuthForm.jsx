import { Eye, EyeOff } from 'lucide-react'
import { Spinner } from '../ui/Spinner.jsx'
import { AVATAR_EMOJIS } from '../../data/archetypes.js'
import { TEXT, text } from '../../lib/theme.js'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="white">
    <path d="M14.04 8.862c-.02-2.175 1.784-3.228 1.864-3.28-1.019-1.487-2.598-1.69-3.154-1.708-1.33-.136-2.61.788-3.286.788-.676 0-1.7-.773-2.8-.751-1.428.021-2.758.839-3.492 2.118C1.675 8.55 2.76 13.1 4.303 15.168c.768 1.102 1.682 2.333 2.876 2.29 1.16-.048 1.596-.742 2.997-.742 1.4 0 1.797.742 3.012.717 1.248-.02 2.033-1.111 2.787-2.22.893-1.272 1.253-2.515 1.268-2.578-.027-.012-2.42-.924-2.443-3.673zM11.773 2.54C12.377 1.81 12.78.82 12.664-.2c-.857.037-1.91.574-2.53 1.286-.549.633-1.035 1.655-.905 2.631.957.073 1.938-.484 2.544-1.177z"/>
  </svg>
)

const inputStyle = { background: text(0.05), border: `1px solid ${text(0.12)}`, color: TEXT }

// Shared social/email/magic-link auth widgets. Consolidates what used to be
// two near-identical implementations (AlienProposalScreen + the screen
// formerly known as MatchingCTASection). Screens own their own surrounding
// chrome and `view` state; this component just renders the form for the
// current view and drives everything through the `auth` hook (useAuthForm).
export function AuthForm({
  auth,
  view, // 'entry' | 'signup' | 'signin' | 'magic'
  onChangeView,
  onSubmitSignUp,
  onSubmitSignIn,
  onSubmitMagicLink,
  showMagicLinkOption = false,
  showSignInLink = false,
  showAvatarPicker = false,
  selectedAvatar,
  onSelectAvatar,
  submitLabel = 'Join Polymath →',
}) {
  const {
    name, setName, email, setEmail, password, setPassword, showPw, setShowPw,
    loading, error, socialLoading, handleSocialAuth,
  } = auth

  return (
    <>
      {error && (
        <div className="rounded-xl px-4 py-2.5 mb-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {view === 'entry' && (
        <>
          <button
            onClick={() => handleSocialAuth('google')}
            disabled={!!socialLoading}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 mb-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'white', color: '#1f1f1f', border: `1px solid ${text(0.14)}`, opacity: socialLoading ? 0.7 : 1 }}>
            {socialLoading === 'google' ? <Spinner size={16} color="#9ca3af" /> : <GoogleIcon />}
            {socialLoading === 'google' ? 'Opening Google…' : 'Continue with Google'}
          </button>

          <button
            onClick={() => handleSocialAuth('apple')}
            disabled={!!socialLoading}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 mb-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#1a1a1a', color: 'white', border: `1px solid ${text(0.15)}`, opacity: socialLoading ? 0.7 : 1 }}>
            {socialLoading === 'apple' ? <Spinner size={16} color="#9ca3af" /> : <AppleIcon />}
            {socialLoading === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: text(0.08) }} />
            <span className="text-xs" style={{ color: text(0.25) }}>or</span>
            <div className="h-px flex-1" style={{ background: text(0.08) }} />
          </div>

          <button onClick={() => onChangeView('signup')}
            className="w-full py-3 rounded-xl text-sm font-medium mb-2 transition-all hover:opacity-80"
            style={{ background: 'rgba(253,41,123,0.12)', color: '#fd297b', border: '1px solid rgba(253,41,123,0.25)' }}>
            Continue with Email
          </button>
          {showMagicLinkOption && (
            <button onClick={() => onChangeView('magic')}
              className="w-full py-2.5 rounded-xl text-sm font-medium mb-3 transition-all hover:opacity-80"
              style={{ color: text(0.35) }}>
              ✨ Email me a magic link
            </button>
          )}
          {showSignInLink && (
            <button onClick={() => onChangeView('signin')}
              className="w-full py-2 rounded-xl text-xs transition-opacity hover:opacity-70"
              style={{ color: text(0.3), border: `1px solid ${text(0.08)}` }}>
              Already have an account? Sign in
            </button>
          )}
        </>
      )}

      {(view === 'signup' || view === 'signin') && (
        <form onSubmit={view === 'signup' ? onSubmitSignUp : onSubmitSignIn} className="space-y-2.5">
          <button type="button" onClick={() => onChangeView('entry')} className="text-xs mb-1 transition-opacity hover:opacity-70"
            style={{ color: text(0.3) }}>← back</button>

          {showAvatarPicker && view === 'signup' && (
            <div className="rounded-xl p-3" style={{ background: text(0.04), border: `1px solid ${text(0.08)}` }}>
              <p className="text-xs mb-2.5 font-medium text-center" style={{ color: text(0.4) }}>Pick your avatar</p>
              <div className="grid grid-cols-5 gap-1.5">
                {AVATAR_EMOJIS.map(em => (
                  <button key={em} type="button" onClick={() => onSelectAvatar?.(em)}
                    className="h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{
                      background: selectedAvatar === em ? 'rgba(253,41,123,0.2)' : text(0.04),
                      border: selectedAvatar === em ? '1.5px solid rgba(253,41,123,0.6)' : `1px solid ${text(0.07)}`,
                      transform: selectedAvatar === em ? 'scale(1.1)' : 'scale(1)',
                    }}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'signup' && (
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10" style={inputStyle} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: text(0.3) }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)', color: 'white', opacity: loading ? 0.7 : 1 }}>
            {loading ? (view === 'signup' ? 'Creating account…' : 'Signing in…') : (view === 'signup' ? submitLabel : 'Sign In →')}
          </button>
          {showSignInLink && (
            <button type="button" onClick={() => onChangeView(view === 'signup' ? 'signin' : 'signup')}
              className="w-full py-2 text-xs transition-opacity hover:opacity-70"
              style={{ color: text(0.3) }}>
              {view === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          )}
        </form>
      )}

      {view === 'magic' && (
        <form onSubmit={onSubmitMagicLink} className="space-y-2.5">
          <button type="button" onClick={() => onChangeView('entry')} className="text-xs mb-1 transition-opacity hover:opacity-70"
            style={{ color: text(0.3) }}>← back</button>
          <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(253,41,123,0.2)', color: '#fd297b', border: '1px solid rgba(253,41,123,0.4)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending…' : '✨ Send magic link'}
          </button>
        </form>
      )}
    </>
  )
}
