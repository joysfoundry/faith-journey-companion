---
story: ACTS-89
session: 01
wrapped_at: 2026-08-27T11:06:30-0700
status: Done
final: true
---

## Closed
Story **Done** (2026-08-27). All acceptance criteria met — per-item expand/collapse,
the expand-all/collapse-all control (delivered as the 4-way mode incl. "Expand all" +
"Keep collapsed"), a sensible praying default ("Expand current only"), and interaction
verified **in the running Guide view** (manual/live — automated tests documented as
planned, deferred to ACTS-92 since no runner is wired). Local-only tracker (no Jira).

## What happened

Built guided-prayer expand/collapse in the **running session view**
(`src/routes/session.$sessionId.tsx`) — NOT `pray.tsx`. The story note pointed at
`pray.tsx`, but that's the Session Builder; the guided prayer view with ACTS-76's
current-highlight + autoscroll is `session.$sessionId.tsx`. Corrected during the session.

JC reframed the AC after seeing the code: the target is the **Guide tab** (the
single-line-per-step overview, which was effectively "all collapsed"), and the
"expand-all / collapse-all" control becomes a **4-way expansion mode**.

Shipped:
- **Guide tab** — each single line now expands to its full text (reuses `ItemView`).
  Expansion is driven by a mode `<select>` (top-right of the list): **Expand current
  only** (default), **Expand as you go** (trail finished + current), **Expand all**,
  **Keep collapsed**. Per-line manual tap overrides the mode until the mode changes.
  The Guide row was split into a **done-circle** (marks done) + an **expand button**
  (`aria-expanded`) so the two gestures don't collide (this replaced the old
  whole-row = mark-done tap — a flagged behavior change, approved).
- Mode→expanded logic extracted to a **pure helper** `src/lib/prayer/guideExpansion.ts`
  (`modeExpands`, `isStepExpanded`, `GUIDE_EXPAND_OPTIONS`, `GUIDE_EXPAND_DEFAULT`) —
  the unit-test target for ACTS-92. All four modes derive from currentId + done-state,
  so "collapse behind you" needs no stored expand state — only manual overrides are stored.
- **ACTS-76 preserved** — `currentRef` still rides the `<li>`, so autoscroll + the
  current-step ring/tint work in every mode.
- **Prayers tab** — removed the redundant top-right check circle per JC (the whole
  card is already the mark-done target; done still shows via grayed styling).

Decisions (JC):
- Keep BOTH tabs (Prayers full-text + Guide expandable) to A/B which gets used more.
- Default mode = "Expand current only"; "expand current" splits into collapse-behind
  (default) vs. keep-finished-open ("Expand as you go").
- Expanded Guide typography currently === Prayers-tab typography (large display).
  JC OK'd as-is for now; a compact variant was offered and deferred.

## Verified (and how)

Live in the in-app browser against this session's dev server (localhost:8080; earlier
ports were hard-denied, cleared once the other chat's server was stopped):
- Guide tab, default mode: only the current "Hail Mary (1/3)" auto-expanded showing full
  text; all others single lines with carets; done items checked + struck through.
- "Expand all" mode: every step expanded inline, including a mystery (scripture +
  reference + "Fruit of the mystery") and Our Father full text; mystery heading +
  "Nth decade" tags render above expanded content.
- Prayers tab after edit: top-right check circle gone from every card; "NOW" tag + ring
  on current, grayed done styling intact; whole-card tap still marks done.
- `npx tsc --noEmit` clean; `npx eslint` clean on both changed files. No test runner
  wired (ACTS-92 deferred), so no unit/integration tests run.

## Git state at handoff

Committed & pushed to `main` (JC pushed):
- `12d527e` ACTS-89: expandable Guide tab + cleaner Prayers cards (code)
- `f34b719` ACTS-89: mark story In Progress (pointer)
- `a58ed42` ACTS-89: session-01 handoff + pointer (docs)
- the /done doc commit (this file → final + pointer/board → Done) follows.

`.claude/launch.json` left untracked on purpose (local dev-server config, not story work).
No unsaved code.

## Next

- ACTS-76 coordination re-check with autoscroll now that lines collapse/expand: confirm
  auto-scroll-to-current still lands well in "Expand current only" as you advance through
  many Hail Marys (looked correct; not stress-tested through a full 79-step decade run).
- Optional (deferred, JC's call): compact typography variant for expanded Guide content
  so it reads distinct from the Prayers tab.
- Optional: persist the chosen expansion mode (currently local component state, resets
  per session open).
- Tests: when ACTS-92 wires Vitest, `guideExpansion.ts` (`modeExpands`/`isStepExpanded`)
  is the ready unit target; integration test for the done-circle vs. expand-button split
  + `aria-expanded` in the running Guide view (per the story's Tests section / E3).
