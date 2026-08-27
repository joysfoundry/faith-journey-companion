---
id: ACTS-76
title: Pray-mode tracker (ACTS-style) — current item, grayed-out completed, auto-scroll
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-89]
started_at: 2026-08-27T09:11:26-0700
updated:    2026-08-27T09:11:26-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying a session, I want the **current prayer** to stand out, **completed
prayers grayed out**, and the view to **auto-scroll** as I advance — so the running
session tracks where I am and I can pray without hunting for my place.

## Acceptance criteria
- [x] The **current item** is visually prominent in the running session view.
      ("NOW" badge + primary ring on the Prayers card; highlighted row on the Guide.)
- [x] **Completed prayers are grayed out** (existing dim + filled check; Guide strikethrough).
- [x] The view **auto-scrolls** to the current/next item as I mark prayers done.
      (Skips the first mount so the session opens at the title; centers the new current.)
- [x] Behavior tested **in the running session view** (`src/routes/session.$sessionId.tsx`),
      in the `manual_done` progress mode — verified in-browser (Litany of Humility, 24 steps).
- [x] Respects `prefers-reduced-motion` for the auto-scroll (smooth→auto via `matchMedia`;
      guarded in code — couldn't emulate the media query in the preview).
- [x] **Switching tabs lands on the current step** — marking items done on the Guide then
      switching to Prayers (or vice-versa) auto-scrolls to the current "NOW" item.

## Tests
_No runner wired yet — these are **planned** (harness = ACTS-92). Manually verified
in-browser this session (Litany of Humility, 24 steps, `manual_done`). See
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md)._

- **Unit** (Vitest — pure logic):
  - `sessionProgress(items)` → `{done,total}` counts complete vs total (compiler already exports it).
  - Current-step derivation: `items.find(i => i.completion_status !== "complete")` returns the
    first incomplete item; **null** when all complete. (Extract to a tiny pure helper so it's unit-testable.)
  - `completeSessionItem` / `uncompleteSessionItem` toggle `completion_status` correctly.
- **Integration** (Testing Library — `session.$sessionId.tsx`):
  - Renders with a seeded session; the first item shows the **"NOW"** badge + `aria-current="step"`;
    others don't.
  - Mark the current item done → badge/ring + `aria-current` move to the next incomplete item;
    the finished card gets the grayed/checked treatment; header count increments.
  - `scrollIntoView` (mocked) is **not** called on first mount, **is** called when the current id changes.
  - `prefers-reduced-motion` (mock `matchMedia`): reduced → `behavior:"auto"`; normal → `"smooth"`.
  - Guide tab mirrors the same current/done state (highlight row, strikethrough on done).
- **E2E** (Playwright): feeds flow **E2** (pray-mode tracker) and **E1** (full session loop).

## Implemented (session 01, 2026-08-27)
- `usePrefersReducedMotion()` + `useAutoScrollToCurrent<T>(currentId, active, reducedMotion)`
  hooks in `session.$sessionId.tsx`. Current = **first item whose `completion_status !== "complete"`**
  (null when all done). Auto-scroll fires when the current id **changes while the tab is active**
  AND when the tab **becomes active** (so a tab-switch lands on the current step). Skips the
  first mount, no-ops on the hidden tab (`offsetParent === null`), centers the current (`block: "center"`).
- Tabs made **controlled** (`value`/`onValueChange` + `tab` state) so each tab knows if it's active.
- Prayers card: `border-primary ring-2 ring-primary/30 shadow-sm` + a "NOW" pill + `aria-current="step"`.
- Guide row: `bg-primary/10 ring-1 ring-primary/30`, primary bold label, `aria-current="step"`.
- **Tab-switch → current** (added session 01, per JC): mark items done on the Guide, switch to
  Prayers → it scrolls to the "NOW" card (and vice-versa). Verified in-browser.

## Notes
- Running session view: `src/routes/session.$sessionId.tsx` (NOT `pray.tsx`, which is the
  plan builder). Two tabs: **Prayers** (bordered cards, tap to mark done) and **Guide**
  (compact list). Progress (`done/total`) is shared across tabs + header.
- **Already in place:** completed cards go gray (`bg-muted/40 opacity-60`, ~L216);
  Guide-tab done rows use `line-through text-muted-foreground` (~L307); `done/total`
  counter + progress bar in the header.
- **Remaining:** prominent "current" treatment + auto-scroll to the active item.
- The ledger notes: "Preview already emits the fully-expanded list" — the compiler
  produces the full ordered item list, so the tracker is a presentation concern.
- Related: ACTS-89 (expand/collapse in the guided view) touches the same surface —
  coordinate so the two don't fight over the same interaction.
- From the ledger `docs/JIRA-BACKLOG.md` (P1).
