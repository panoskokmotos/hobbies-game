-- ─────────────────────────────────────────────────────────────────────────────
-- Polymath — Supabase schema + Row Level Security
--
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- Safe to re-run (IF NOT EXISTS / drop-and-recreate policies).
--
-- Tables: profiles, swipes, matches, messages. Auth users live in Supabase's
-- built-in auth.users; every *_id below is that uuid.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  archetype_id     text,
  liked_card_ids   jsonb  default '[]'::jsonb,
  category_scores  jsonb  default '{}'::jsonb,
  recommendations  jsonb,
  display_name     text,
  avatar_emoji     text,
  bio              text,
  push_subscription jsonb,
  created_at       timestamptz default now()
);

create table if not exists public.swipes (
  id          bigint generated always as identity primary key,
  swiper_id   uuid not null references auth.users (id) on delete cascade,
  swiped_id   uuid not null references auth.users (id) on delete cascade,
  direction   text not null check (direction in ('like', 'pass', 'superlike')),
  created_at  timestamptz default now(),
  unique (swiper_id, swiped_id)
);

create table if not exists public.matches (
  id          bigint generated always as identity primary key,
  user_a_id   uuid not null references auth.users (id) on delete cascade,
  user_b_id   uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz default now(),
  -- api.js canonicalizes (user_a_id < user_b_id) before insert, so this UNIQUE
  -- makes duplicate matches impossible even under a concurrent mutual swipe —
  -- the durable fix for the race the client could only narrow.
  unique (user_a_id, user_b_id)
);

create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  match_id    bigint not null references public.matches (id) on delete cascade,
  sender_id   uuid not null references auth.users (id) on delete cascade,
  content     text not null,
  read_at     timestamptz,
  created_at  timestamptz default now()
);

create index if not exists swipes_swiper_idx  on public.swipes (swiper_id);
create index if not exists swipes_swiped_idx  on public.swipes (swiped_id);
create index if not exists matches_a_idx       on public.matches (user_a_id);
create index if not exists matches_b_idx       on public.matches (user_b_id);
create index if not exists messages_match_idx  on public.messages (match_id);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Without these policies, RLS (enabled below) makes every query return empty —
-- the classic "Supabase returns nothing" gotcha. These grant exactly what the
-- app needs and nothing more.

alter table public.profiles enable row level security;
alter table public.swipes   enable row level security;
alter table public.matches  enable row level security;
alter table public.messages enable row level security;

-- profiles: anyone signed in can read profiles (discovery + comparison);
-- you may only write your own.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- swipes: you can see swipes you made or that were made on you; you may only
-- create/delete your own.
drop policy if exists swipes_select on public.swipes;
create policy swipes_select on public.swipes
  for select to authenticated using (auth.uid() = swiper_id or auth.uid() = swiped_id);
drop policy if exists swipes_insert on public.swipes;
create policy swipes_insert on public.swipes
  for insert to authenticated with check (auth.uid() = swiper_id);
drop policy if exists swipes_delete on public.swipes;
create policy swipes_delete on public.swipes
  for delete to authenticated using (auth.uid() = swiper_id);

-- matches: only the two people in a match can see / create / remove it.
drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches
  for select to authenticated using (auth.uid() = user_a_id or auth.uid() = user_b_id);
drop policy if exists matches_insert on public.matches;
create policy matches_insert on public.matches
  for insert to authenticated with check (auth.uid() = user_a_id or auth.uid() = user_b_id);
drop policy if exists matches_delete on public.matches;
create policy matches_delete on public.matches
  for delete to authenticated using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- messages: readable/writable only by the two people in the parent match.
-- (UPDATE is what powers read receipts — the recipient marks the sender's
--  messages read, so it's gated on match membership, not on being the sender.)
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated using (
    exists (select 1 from public.matches m
            where m.id = messages.match_id
              and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id and
    exists (select 1 from public.matches m
            where m.id = match_id
              and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())));
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated using (
    exists (select 1 from public.matches m
            where m.id = messages.match_id
              and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())));
