# Push notifications — deploy runbook

The client already does its half (see `src/lib/push.js` and `public/sw.js`):
it registers the service worker, subscribes the browser to Web Push, and
stores the subscription on the user's profile (`profiles.push_subscription`).
And `src/lib/api.js → notifyUser` already fires a request to a `notify-user`
function on every match and super-like.

What's left is the **send side**, which can't live in the browser because it
needs the VAPID **private** key. That's `notify-user.ts` in this folder. Until
you deploy it and set the keys below, everything still works — pushes just
silently don't send (the client call is fire-and-forget and swallowed).

## One-time setup

**1. Generate a VAPID key pair**

```bash
npx web-push generate-vapid-keys
```

You get a **public** key and a **private** key.

**2. Set the PUBLIC key on the client (Vercel)**

In your Vercel project → Settings → Environment Variables:

```
VITE_VAPID_PUBLIC_KEY = <public key>
```

Redeploy. `src/lib/push.js` reads this so the browser can subscribe. (Public
VAPID keys are meant to be public — safe to expose. The private key never goes
in a `VITE_`-prefixed var.)

**3. Make sure the `profiles` table has a `push_subscription` column**

JSON/JSONB. `src/lib/push.js` writes the browser's `PushSubscription.toJSON()`
here; the function reads it back.

**4. Deploy the function with the PRIVATE key as a server-side secret**

Option A — from a Node script using an admin API key:

```js
import { createClient } from '@butterbase/sdk'
import { readFileSync } from 'node:fs'

const bb = createClient({ appId: 'app_lrf3gppzq7v5', apiUrl: 'https://api.butterbase.ai' })
await bb.admin.authenticateWithApiKey(process.env.BUTTERBASE_ADMIN_KEY) // however your SDK version auths admin

await bb.admin.functions.deploy({
  name: 'notify-user',
  code: readFileSync('./butterbase/functions/notify-user.ts', 'utf8'),
  trigger: 'http',
  envVars: {
    VAPID_PUBLIC_KEY:  process.env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,   // ← secret, server-only
    VAPID_SUBJECT:     'mailto:you@yourdomain.com',
    BUTTERBASE_APP_ID: 'app_lrf3gppzq7v5',
    BUTTERBASE_API_URL:'https://api.butterbase.ai',
    BUTTERBASE_SERVICE_KEY: process.env.BUTTERBASE_SERVICE_KEY, // server key that can read profiles
  },
})
```

Option B — paste `notify-user.ts` into the Butterbase dashboard's Functions UI,
name it `notify-user`, set the same env vars there, and deploy.

## Verify end-to-end

1. Two accounts (two browsers/devices), both signed in, both tapped **Enable**
   on their Profile (grants notification permission + stores a subscription).
2. From account A, super-like account B (swipe up) or create a mutual match.
3. Account B should get a system notification within a second or two.
4. If nothing arrives: check the function's logs
   (`bb.admin.functions.logs('notify-user')` or the dashboard) — the usual
   culprits are a missing `push_subscription` column, a wrong/rotated VAPID key
   pair, or the `VITE_VAPID_PUBLIC_KEY` on the client not matching the
   `VAPID_PUBLIC_KEY` on the function (they **must** be the same pair).

## Notes / adapting to your runtime

`notify-user.ts` targets a Deno-style Web-standard runtime (`Request`/`Response`,
`npm:` imports) — the shape Butterbase functions use. If your Butterbase runtime
differs (e.g. a different handler signature, no `npm:web-push`), the logic is
small and portable: read `push_subscription` for `toUserId`, then send a
VAPID-signed Web Push with `{ title, body, url }` as the payload (that's exactly
what `public/sw.js` expects to receive).
