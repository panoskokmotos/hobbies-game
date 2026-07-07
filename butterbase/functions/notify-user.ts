// ─────────────────────────────────────────────────────────────────────────────
// notify-user — Butterbase serverless function (HTTP trigger)
//
// The SEND side of push notifications. The client (src/lib/api.js → notifyUser)
// calls this whenever a match happens or someone super-likes you. It looks up
// the target user's stored Web Push subscription and sends them a notification,
// signed with the VAPID *private* key that must never leave the server.
//
// ⚠️ SCAFFOLD — this cannot be runtime-tested from the app repo. It targets a
// Deno-style Web-standard runtime (fetch/Request/Response), which is what
// Butterbase functions run. Depending on your Butterbase runtime you may need
// to adjust the imports (npm: specifier, service-client construction). See
// ./README.md for the full deploy runbook.
//
// Request body (POST JSON): { toUserId, title, body, url }
// Env vars required:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT   (mailto:you@domain)
//   BUTTERBASE_APP_ID, BUTTERBASE_API_URL, BUTTERBASE_SERVICE_KEY
// ─────────────────────────────────────────────────────────────────────────────

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@butterbase/sdk'

const env = (k: string) => (globalThis as any).Deno?.env.get(k) ?? (globalThis as any).process?.env?.[k]

const bb = createClient({
  appId: env('BUTTERBASE_APP_ID'),
  apiUrl: env('BUTTERBASE_API_URL') ?? 'https://api.butterbase.ai',
  // A server-side service/admin key — NOT a VITE_-prefixed client value. This
  // lets the function read any profile's push_subscription server-side.
  anonKey: env('BUTTERBASE_SERVICE_KEY'),
})

webpush.setVapidDetails(
  env('VAPID_SUBJECT') ?? 'mailto:admin@polymath.app',
  env('VAPID_PUBLIC_KEY'),
  env('VAPID_PRIVATE_KEY'),
)

export async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload: { toUserId?: string; title?: string; body?: string; url?: string }
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { toUserId, title, body, url } = payload
  if (!toUserId || !title) {
    return Response.json({ error: 'toUserId and title are required' }, { status: 400 })
  }

  // Look up the target's stored subscription (written by src/lib/push.js).
  const { data, error } = await bb
    .from('profiles')
    .select('push_subscription')
    .eq('user_id', toUserId)
    .limit(1)

  if (error) return Response.json({ error: 'lookup failed' }, { status: 500 })

  const subscription = data?.[0]?.push_subscription
  if (!subscription) {
    // Not subscribed — a normal, expected case. Nothing to send.
    return Response.json({ sent: false, reason: 'no subscription' }, { status: 200 })
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body: body ?? '', url: url ?? '/' }),
    )
    return Response.json({ sent: true }, { status: 200 })
  } catch (err: any) {
    // 404/410 → the subscription is dead (browser/permission revoked); clear it
    // so we stop trying to reach it.
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await bb.from('profiles').update({ push_subscription: null }).eq('user_id', toUserId)
      return Response.json({ sent: false, reason: 'expired, cleared' }, { status: 200 })
    }
    return Response.json({ error: 'send failed' }, { status: 500 })
  }
}

export default handler
