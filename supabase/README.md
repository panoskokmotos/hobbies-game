# Supabase setup

The app talks to Supabase for auth, profiles, swipes, matches, and chat. One-time setup:

## 1. Create the project + schema
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → paste [`schema.sql`](./schema.sql) → Run.** This creates the
   `profiles` / `swipes` / `matches` / `messages` tables and their Row Level
   Security policies. (RLS is required — without the policies every query
   silently returns empty.)

## 2. Point the app at it (Vercel env vars)
Project Settings → API gives you the **Project URL** and the **anon public** key.
In Vercel → Settings → Environment Variables:

```
VITE_SUPABASE_URL       = https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY  = <anon public key>
```

Redeploy. (The anon key is meant to be public — RLS is what protects the data.)
Until these are set, the app still boots and the swipe → archetype → share flow
works; auth/matches/chat just won't function.

## 3. Auth settings
- **Email:** Authentication → Providers → Email. For instant signup (best UX
  here), turn **"Confirm email" OFF**. If you leave it on, users get a
  confirmation email and the app's "check your inbox" flow handles it — the
  swipe data is bridged and saved after they confirm.
- **Google / Apple (optional):** enable those providers and add your site
  origin (e.g. `https://your-app.vercel.app`) to the redirect allow-list. The
  app already calls `signInWithOAuth` with the right redirect.

## 4. Push notifications (optional)
The push send-side (`api/notify.js`) uses the **service-role** key to read a
user's stored subscription. In Vercel add:

```
SUPABASE_URL               = https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = <service_role key — SECRET, server only>
VAPID_PUBLIC_KEY           = <from `npx web-push generate-vapid-keys`>
VAPID_PRIVATE_KEY          = <same command — SECRET>
VAPID_SUBJECT              = mailto:you@yourdomain.com
```

…and set `VITE_VAPID_PUBLIC_KEY` (the **same** public key) as a client env var.
The `push_subscription` column already exists in the schema.

## Verify
Sign up on the deployed site, reload, and confirm you're still logged in — then
swipe/match/chat across two accounts.
