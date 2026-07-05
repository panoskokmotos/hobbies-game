import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { getMessages, sendMessage, markMessagesRead } from '../lib/api.js'
import { Modal } from '../components/ui/Modal.jsx'
import { TEXT, text as muted } from '../lib/theme.js'

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────

export function ChatScreen({ match, otherProfile, otherArch, myLikedCards, user, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [phase, setPhase] = useState(0)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  const sharedIds = new Set(otherProfile?.liked_card_ids || [])
  const sharedCards = (myLikedCards || []).filter(c => sharedIds.has(c.id)).slice(0, 3)
  const icebreakers = sharedCards.map(c => `What got you into ${c.emoji} ${c.label}?`)
  if (icebreakers.length < 3) icebreakers.push("What's the most surprising thing you're into?", "What would you do with an extra hour every day?")

  const loadMessages = useCallback(async () => {
    const { data } = await getMessages(match.id)
    if (mountedRef.current) setMessages(data || [])
    // Mark whatever the other person sent as read now that we've viewed the
    // chat — their client will pick this up on its next poll and show "Seen".
    if (otherProfile?.user_id) markMessagesRead(match.id, otherProfile.user_id)
  }, [match.id, otherProfile?.user_id])

  useEffect(() => {
    loadMessages()
    const phaseTimer = setTimeout(() => setPhase(1), 80)
    pollRef.current = setInterval(loadMessages, 5000)
    return () => { clearTimeout(phaseTimer); clearInterval(pollRef.current) }
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content = text) => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true)
    setSendError(false)
    setText('')
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, sender_id: user.id, content: trimmed, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])
    try {
      const { error } = await sendMessage(match.id, user.id, trimmed)
      if (error) throw new Error(error.message || 'Failed to send')
      await loadMessages()
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setText(trimmed)
      setSendError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal variant="sheet" phase={phase}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${muted(0.07)}` }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: muted(0.07) }}>
          <X size={18} color={muted(0.6)} />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(253,41,123,0.15)', border: '1px solid rgba(253,41,123,0.3)' }}>
          {otherProfile?.avatar_emoji || otherArch?.emoji || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: TEXT }}>{otherProfile?.display_name || 'Anonymous'}</p>
          <p className="text-xs truncate" style={{ color: muted(0.35) }}>{otherArch?.name || 'Explorer'}</p>
        </div>
        {sharedCards.length > 0 && (
          <div className="flex gap-1">
            {sharedCards.map((c, i) => <span key={i} className="text-base">{c.emoji}</span>)}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm mb-1" style={{ color: muted(0.3) }}>Start with a question</p>
            <p className="text-xs" style={{ color: muted(0.18) }}>or tap a suggestion below</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const mine = msg.sender_id === user.id
          const isLastMine = mine && !messages.slice(i + 1).some(m => m.sender_id === user.id)
          return (
            <div key={msg.id || i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={mine
                  ? { background: 'linear-gradient(135deg,#fd297b,#ff655b)', color: 'white', borderBottomRightRadius: 6 }
                  : { background: muted(0.06), color: TEXT, borderBottomLeftRadius: 6 }}>
                {msg.content}
              </div>
              {isLastMine && (
                <p className="text-xs mt-1 mr-1" style={{ color: muted(0.25) }}>
                  {msg.read_at ? 'Seen' : 'Delivered'}
                </p>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Icebreaker chips */}
      {messages.length === 0 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {icebreakers.slice(0, 3).map((q, i) => (
            <button key={i} onClick={() => handleSend(q)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: muted(0.07), color: muted(0.55), border: `1px solid ${muted(0.1)}`, whiteSpace: 'nowrap' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-8 pt-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${muted(0.07)}` }}>
        {sendError && (
          <p className="text-xs mb-2" style={{ color: '#fca5a5' }}>Message didn't send — check your connection and try again.</p>
        )}
        <div className="flex gap-3 items-end">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Say something…"
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: muted(0.05), border: `1px solid ${muted(0.12)}`, caretColor: '#fd297b', color: TEXT }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)' }}>
            <ChevronRight size={20} color="#000" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
