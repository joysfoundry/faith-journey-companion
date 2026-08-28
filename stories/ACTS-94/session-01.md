---
story: ACTS-94
session: 01
wrapped_at: 2026-08-28T12:31:37-0700
status: Done
final: true
---

## What happened
Built the full guest "follow-along" sharing feature — share a session so people can pray
along on their phones — and finished by making the links **short and titled** via a backend.

- **Share codec** (`src/lib/prayer/share.ts`) — compiles a session's guest-rendered fields +
  an identity-free cover into a compressed, URL-safe payload; `decodeShare` never throws.
- **`ItemView` extracted** to a shared component (`ItemViewData` prop) so Prayer Mode and the
  guest view render items identically.
- **Guest `/follow` view** (`FollowAlongView`) — read-only, self-paced cover + prayers; states
  for loading / empty / invalid.
- **`ShareDialog`** — copy + native share + best-effort QR, optional intention/welcome; used by
  the running-session header (leader), each **Upcoming** row in Pray (share a plan ahead of
  time), and the guest view (re-share / handoff).
- **Short, titled backend links** — Supabase `shared_sessions` table (public RLS);
  `shareStore.ts` `createShare`→`aug-28-litany-of-humility-7k2p` / `fetchShare`; routes split
  into a `/follow` `<Outlet>` layout + `follow.index.tsx` (fragment) + `follow.$shareId.tsx`
  (fetch by slug). `ShareDialog` creates a short link, **falls back to the fragment link** if
  the DB is unreachable; re-share reuses the existing slug. Solved the "link is too long" issue.

## Verified (and how)
- `tsc --noEmit` + eslint clean throughout (generated `types.ts` matched to its existing style).
- Codec: 36 round-trip/rejection assertions via an ephemeral `npx tsx` harness.
- Browser (own dev server): guest `/follow` fragment renders cover + read-only prayers; garbled
  fragment → friendly reshare message; leader Share dialog (intention/welcome) + Upcoming-row
  Share icon; **backend end-to-end** — create → `/follow/aug-28-pray-with-the-pope-e2af`, open
  it → fetch + render, reshare → same slug, QR fits. JC applied the migration (query succeeded).

## Acceptance criteria
All met. Public route; encode/decode; guest read-only view; cover (date·title·purpose·info);
best-effort QR; identity-free payload; handoff/re-share; share-on-upcoming-sessions; and the
short/titled backend links (the added requirement). Live-sync, app-user adopt, and the
signed-in path were intentionally deferred.

## Git state at handoff
Committed to local `main` (9 commits: `4ecba46`, `d22c800`, `7991b4e`, `c1fd532`, `fcf6a94`,
`7dd1b81`, `003e28f`, `4ea6aff`, `d4516e1`). **PUSH PENDING** — this environment has no GitHub
credentials; run `git push origin main` from an authenticated client (local is ahead of origin).
The Supabase table is live (applied via the Lovable SQL editor).

## Next
Spun off **ACTS-95** (parked, To Do) — "Pray a shared session in the app": an app user adopts a
`/follow` link into their sessions and prays it with full Prayer Mode, with the opportunity to
sign in and save it to their sessions list. Also available on the same Supabase connection when
wanted: auth login (ACTS-87) + account creation (ACTS-88), and persistence (ACTS-82).
