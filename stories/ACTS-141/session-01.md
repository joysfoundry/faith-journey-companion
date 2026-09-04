---
story: ACTS-141
session: 01
wrapped_at: 2026-09-03T23:09:38-0700
status: Done
final: true
---

## What happened
Empty Lectio sessions left by an abandoned "Begin" are now reaped. Two mechanisms:

- **Load sweep** — `pruneEmptyLectioSessions` clears accumulated empties as the db loads
  ([`app-store-provider.tsx`](../../src/components/app-store-provider.tsx)).
- **On exit** — the session's **Close** runs `leaveSession`, pruning the current session
  if it's an empty Lectio ([`session.$sessionId.tsx`](../../src/routes/session.$sessionId.tsx)).

"Empty" = no linked reflections **and** no completed steps (`isEmptyLectioSession`,
[`store.ts`](../../src/lib/prayer/store.ts)) — conservative, so any engagement is kept.
Lectio-scoped. No data-model change, no `STORAGE_KEY` bump.

**Decision recorded (AC):** chose **prune** over lazy-create (the Lectio player needs a
persisted session to render, so lazy-create would mean restructuring the player), and
**Lectio-only**.

**Regression caught + fixed in-session:** the first cut pruned in an **unmount effect**.
This router unmounts/remounts the route mid-navigation, so the cleanup fired right after
Begin and deleted the just-opened session — every Begin showed "Preparing your session…".
Reworked to the explicit **Close** handler (a deliberate leave), with the load sweep as
the backstop for back/swipe-away exits.

## Verified (and how)
Own dev server (:8080), browser-driven, at the persistence layer:
- Begin renders the session (0/4) — regression fixed.
- Close on an **empty** Lectio → home, session reaped (Lectio count unchanged).
- Journal one movement → Close → session **kept** (count +1, reflection persisted).
- Load sweep cleared previously-accumulated empties on load.
- ACTS-140 Journal folding still renders (no regression; "1 movement" pluralization OK).
- `tsc` + `eslint` clean; all four touched modules serve 200.

All acceptance criteria met.

## Git state at handoff
Committed to `main`, **push pending** (local pushes failing on auth — flush from JC's git
client). ACTS-141 commits: `0400f2d` (reap) + this handoff. `.env` left untracked-dirty.

## Next
Story complete. Note the "on exit" prune is the Close button specifically; back/swipe-away
relies on the load sweep (by design, JC-approved). To publish: `git push origin main`.
