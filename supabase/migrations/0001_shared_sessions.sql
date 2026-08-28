-- ACTS-94 — shared "follow-along" prayer sessions (short, titled links).
--
-- Stores a public, read-only snapshot of a compiled prayer session, addressed by a
-- short human-readable slug (date + prayer title + a random suffix), e.g.
--   aug-28-litany-of-humility-7k2p
-- so a guest link is `<origin>/follow/aug-28-litany-of-humility-7k2p` instead of a
-- ~10 KB self-contained fragment.
--
-- `payload` is the SAME lz-string-compressed SharePayload the fragment link uses
-- (src/lib/prayer/share.ts) — so the guest view decodes it identically. No personal
-- data is stored; the prayers are public domain.
--
-- Access model — PUBLIC by design:
--   * anon INSERT is allowed because a guest (no account) must be able to create and
--     hand off a share (the ACTS-94 re-share/handoff requirement).
--   * anon SELECT is allowed because anyone holding the link must be able to open it.
-- There is no UPDATE/DELETE policy, so rows are immutable and cannot be removed by
-- clients. Abuse mitigation (rate limiting / cleanup of old rows) is a later concern.

create table if not exists public.shared_sessions (
  slug        text primary key,
  payload     text not null,
  created_at  timestamptz not null default now()
);

alter table public.shared_sessions enable row level security;

-- Anyone (guest or signed-in) may create a share.
drop policy if exists "shared_sessions_public_insert" on public.shared_sessions;
create policy "shared_sessions_public_insert"
  on public.shared_sessions
  for insert
  to anon, authenticated
  with check (true);

-- Anyone with the link may read it.
drop policy if exists "shared_sessions_public_select" on public.shared_sessions;
create policy "shared_sessions_public_select"
  on public.shared_sessions
  for select
  to anon, authenticated
  using (true);
