-- ACTS-162 — in-app feedback from beta testers.
--
-- Oravia is local-first: everything a person creates lives in localStorage. This is the
-- THIRD deliberate path off-device (after creating a share link and fetching an import),
-- and the first that sends something the person wrote about themselves. That is why the
-- form states plainly what leaves, and why this table holds NOTHING from the journey —
-- no prayers, no reflections, no session data. The Markdown export (ACTS-157) is the
-- deliberate path for those, and it stays separate.
--
-- Every column here is something the person can SEE ON SCREEN before they press send.
-- `route` and `device` are prefilled but visible and removable; there is deliberately no
-- raw user-agent string, no ip, and no silent identifier. If a field cannot be shown in
-- the form, it does not belong in this table.
--
-- Access model — CLOSED by design (the ACTS-94 lockdown pattern from 0002, applied from
-- the start rather than retrofitted): RLS enabled with NO policies, revoked from the
-- client roles, granted only to service_role. Writes go through a server function
-- (src/lib/prayer/feedback.functions.ts) which validates and caps the input.
-- Insert-only in practice: there is no client read path, so no one can enumerate
-- anyone else's feedback.

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  message       text not null,
  kind          text not null default 'other',
  -- Optional context. Prefilled from the app but shown to the person, and removable.
  display_name  text,
  route         text,
  device        text,
  -- Null today (there are no accounts yet). When auth lands (ACTS-87/88) new rows can
  -- carry the signed-in user without touching this table's shape or its access model.
  -- ON DELETE SET NULL, not CASCADE: feedback already sent is a message to the author,
  -- like an email — deleting an account de-identifies it rather than retracting it.
  user_id       uuid references auth.users (id) on delete set null,

  constraint feedback_message_not_blank check (btrim(message) <> ''),
  constraint feedback_message_max_len   check (char_length(message) <= 4000),
  constraint feedback_kind_known        check (kind in ('bug', 'idea', 'other'))
);

-- Newest-first is the only way this is ever read (by the author, in the dashboard).
create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- No policies: with RLS on and none defined, anon and authenticated are denied by
-- default. The revoke makes that explicit rather than implicit.
revoke all on public.feedback from anon, authenticated;
grant all on public.feedback to service_role;
