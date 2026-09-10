---
story: ACTS-190
session: 01
wrapped_at: 2026-09-10T15:21:19-0700
status: Done
final: true
---

## What happened
Added a **"New prayer"** item to the Home **Prayer & Devotion** card's ⋯ (`MoreVertical`)
menu. It sits directly below the existing **"New session"** item and navigates to
`/import?mode=single` (Devotion Builder, single-prayer mode) — the same destination and
wiring as the `/prayers` page's "New prayer" (`src/routes/prayers.tsx:582`). Reused the
already-imported `Plus` icon; no new form or route added.

- Edit: [`src/routes/index.tsx`](../../src/routes/index.tsx) ~L661 — second `DropdownMenuItem`.
- "New session" (`/pray?build=true`) left untouched.

## Verified (and how)
- **Typecheck:** `npx tsc --noEmit` — no errors in `index.tsx`.
- **Pattern parity:** change is a line-for-line mirror of the proven `/prayers` ⋯ menu
  item, which already routes to `/import?mode=single`.
- **Browser preview: not run.** Two other chats' dev servers held ports 8080/8081, vite
  drifted to 8082, and the preview proxy expected a different port → navigation denied
  (the known port-drift gotcha). Given the trivial, mirrored change, typecheck + parity
  were used instead. A live screenshot is available once 8080 is free.

## Acceptance criteria — all met
- [x] ⋯ menu shows a "New prayer" item (`Plus` icon) alongside "New session".
- [x] Routes to `/import?mode=single` (Devotion Builder, single-prayer mode).
- [x] "New session" unchanged; labels distinguish *session* vs *prayer*.

## Git state at handoff
Committed & pushed to `origin/main`:
- `b052676` — ACTS-190: add "New prayer" to Home Prayer & Devotion menu
- `e54bd87` — ACTS-190: mark status In Progress + acceptance criteria met

(This final handoff + board/pointer update will be committed by `/wrap`.)

## Next
Story complete. Relates to **ACTS-182** (Home redesign / nav reshuffle) and **ACTS-191**
(`/word` expanded page) — both still To Do.
