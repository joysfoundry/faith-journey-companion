---
story: ACTS-97
session: 01
wrapped_at: 2026-08-28T17:25:59-0700
status: Done
final: true
---

## Completion (2026-08-28)
**Story DONE — all acceptance criteria met.** JC re-confirmed the browser spot-check
on both pages / both entry paths (the one AC I couldn't self-verify via the in-app
preview this session — that was an infra glitch, not the code). Nothing left open.

## What happened
Implemented the "land on the browse/list tab by default" change on both pages,
exactly per the pointer's design.

- **Vessels / Formation** ([`src/routes/formation.tsx`](../../src/routes/formation.tsx)):
  swapped the two `<TabsTrigger>`s so **Library is first, Add second**. The default
  logic (`add ? "add" : "library"`) already landed on Library, so only the visual
  order changed. `?add=true` and the home add entry points still open Add — untouched.
- **Plan / Pray** ([`src/routes/pray.tsx`](../../src/routes/pray.tsx)): added a
  `validateSearch` accepting a `build` flag (mirrors Formation's `add`); read it via
  `Route.useSearch()`; defaulted the tab to `build ? "builder" : "sessions"`; swapped
  the triggers so **Sessions is first, Session Builder second**.
- **Home** ([`src/routes/index.tsx`](../../src/routes/index.tsx)): the devotion card's
  ⋮ → "New session" now navigates with `search: { build: true }` so it still opens the
  Builder. The nav-rail "Plan" link intentionally lands on Sessions (the new default).

Also, mid-session, filed a new backlog story:
- **ACTS-98** (low priority) — month calendar in Plan > Sessions with color-coded
  per-day dots (prayer sessions / planned sessions / daily readings / programs / past
  reflections) + an upcoming-next-month session list; supersede the orphaned
  `/calendar` route. Pointer: [`stories/ACTS-98.md`](../ACTS-98.md); board + ledger rows
  added; `.counter` → 98.

## Verified (and how)
- `npx tsc --noEmit` — **clean**.
- Dev server (Vite) compiled the changed routes with **no errors** (`preview_logs`
  level=error → none).
- **JC spot-checked both pages in the browser** (on the parallel session's dev server,
  `localhost:8080`, which shares these source files via HMR) and confirmed it looks right.
- ⚠️ Could NOT run the in-app browser-preview check myself this session: the preview
  **proxy never bound a listener** (assigned proxy port returned curl `000` while Vite
  itself served on `:8083`), and the real-Chrome extension was not connected. Root
  cause was two dev servers running against the same repo folder (this session + the
  parallel ACTS-96 chat) confusing the preview manager — an infra glitch, not the code.
  So AC "Verified in the browser preview" is satisfied by JC's manual spot-check, not by
  an in-tool screenshot.

## Git state at handoff
**committed & pushed.** ACTS-97 code `fda1934` + ACTS-97/98 docs `9208dd1` are on
`origin/main` (the parallel ACTS-96 session pushed on top of them; `origin/main` = HEAD,
0 ahead / 0 behind). Working tree clean apart from this handoff commit. No unsaved code.

## Next
- If satisfied, run **`/done`** to close ACTS-97 (all ACs met; browser check covered by
  JC's spot-check).
- ACTS-98 is filed and ready to `/start` when its low priority comes up — first settle
  the parked open questions in the pointer (dot-color encoding per category + per-day
  dot cap; does day-tap filter the list or is it always "next month"; keep or delete the
  repurposed `/calendar` route).
