// ─────────────────────────────────────────────────────────────────────────────
// Vercel serverless function — sends a Web Push to one user.
//
// Triggered by the client (src/lib/api.js → notifyUser) on a new match and on a
// super-like received. It deploys automatically with the rest of the app on
// Vercel — no Butterbase function runtime needed. Butterbase stays purely the
// database: we read the target's stored push_subscription from it, then send.
//
// Until the env vars below are set this is a safe no-op (returns "not
// configured"), and the client call is fire-and-forget, so nothing breaks.
//
// Vercel → Settings → Environment Variables:
//   VAPID_PUBLIC_KEY        same public key as the client's VITE_VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY       secret — server only, never VITE_-prefixed
//   VAPID_SUBJECT           mailto:you@yourdomain.com
//   BUTTERBASE_APP_ID       optional (defaults to app_lrf3gppzq7v5)
//   BUTTERBASE_API_URL      optional (defaults to https://api.butterbase.ai)
//   BUTTERBASE_SERVICE_KEY  optional server key that can read profiles
// ─────────────────────────────────────────────────────────────────────────────

import webpush from 'web-push'
import { createClient } from '@butterbase/sdk'

const bb = createClient({
  appId: process.env.BUTTERBASE_APP_ID || 'app_lrf3gppzq7v5',
  apiUrl: process.env.BUTTERBASE_API_URL || 'https://api.butterbase.ai',
  anonKey: process.env.BUTTERBASE_SERVICE_KEY,
})

let vapidReady = false
function ensureVapid() {
  if (vapidReady) return true
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@polymath.app', pub, priv)
  vapidReady = true
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // Not configured yet → succeed quietly so the client's fire-and-forget call
  // never surfaces an error while you're still setting up keys.
  if (!ensureVapid()) return res.status(200).json({ sent: false, reason: 'push not configured' })

  const { toUserId, title, body, url } = req.body || {}
  if (!toUserId || !title) return res.status(400).json({ error: 'toUserId and title are required' })

  // Look up the target's stored subscription (written by src/lib/push.js).
  const { data, error } = await bb
    .from('profiles')
    .select('push_subscription')
    .eq('user_id', toUserId)
    .limit(1)
  if (error) return res.status(500).json({ error: 'lookup failed' })

  const subscription = data?.[0]?.push_subscription
  if (!subscription) return res.status(200).json({ sent: false, reason: 'no subscription' })

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body: body || '', url: url || '/' }),
    )
    return res.status(200).json({ sent: true })
  } catch (err) {
    // 404/410 → dead subscription (permission revoked / browser cleared it):
    // clear it so we stop trying.
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await bb.from('profiles').update({ push_subscription: null }).eq('user_id', toUserId)
      return res.status(200).json({ sent: false, reason: 'expired, cleared' })
    }
    return res.status(500).json({ error: 'send failed' })
  }
}
