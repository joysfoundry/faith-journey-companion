-- Hardening: shared_sessions is no longer reachable from the browser.
-- All reads/writes go through server functions (src/lib/prayer/share.functions.ts)
-- using the service role, which validate the slug and cap payload size.
-- RLS stays enabled with NO policies, so client roles are denied by default.
revoke all on public.shared_sessions from anon, authenticated;
grant all on public.shared_sessions to service_role;
drop policy if exists "shared_sessions_public_insert" on public.shared_sessions;
drop policy if exists "shared_sessions_public_select" on public.shared_sessions;
alter table public.shared_sessions enable row level security;
