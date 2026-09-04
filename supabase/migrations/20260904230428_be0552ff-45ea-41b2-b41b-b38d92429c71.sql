revoke all on public.shared_sessions from anon, authenticated;
grant all on public.shared_sessions to service_role;
drop policy if exists "shared_sessions_public_insert" on public.shared_sessions;
drop policy if exists "shared_sessions_public_select" on public.shared_sessions;
alter table public.shared_sessions enable row level security;