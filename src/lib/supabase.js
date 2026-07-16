import { createClient } from '@supabase/supabase-js'

// Supabase client. Real values come from Vercel env (VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY — the anon key is meant to be public; row-level
// security in the DB is what protects the data, not key secrecy).
//
// Falls back to harmless placeholders when unset so the app still boots and the
// fully client-side flow (swipe → archetype → share/compare) works even before
// the backend is wired — every backend call is already wrapped in try/catch and
// degrades gracefully. Set the real values and redeploy to light up auth/
// matches/chat. See supabase/README.md for the one-time setup.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(url, anonKey)
