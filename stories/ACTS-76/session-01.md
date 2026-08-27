---
story: ACTS-76
session: 01
wrapped_at: 2026-08-27T10:06:53-0700
status: Done
final: true
---

## What happened
Built the **pray-mode tracker** in the running session view (`src/routes/session.$sessionId.tsx`):

- **Current step is prominent** — the first not-yet-done item gets a "NOW" badge + primary
  ring on the Prayers card and a highlighted row on the Guide; both carry `aria-current="step"`.
- **Completed prayers gray out** — kept the existing dim + filled check, plus the Guide's
  strikethrough.
- **Auto-scroll** — centers the current step when it changes while a tab is active **and**
  when a tab becomes active. So marking items done on the Guide then switching to Prayers
  (or vice-versa) lands on the "NOW" card — the follow-up JC asked for. Skips the first mount
  (opens at the title), no-ops the hidden tab, honors `prefers-reduced-motion`. Tabs made
  **controlled** so each tab knows whether it's active.

Alongside the feature: established the **testing convention** (ACTS-91, Done) — a required
Tests section in `_TEMPLATE.md`, the `docs/E2E-TEST-PLAN.md` flow catalog (E1–E15), and a
ledger Process rule — and spun off the deferred **harness build** as ACTS-92.

## Verified (and how)
- In-browser, `manual_done` mode, Litany of Humility (24 steps): progress ticked as items
  were marked; completed cards grayed/checked; "NOW" badge + ring advanced; view auto-centered
  each new current.
- **Tab-switch → current**: marked #20 done on the Guide → switched to Prayers → landed
  directly on #21 "NOW". Guide also centers the current on activation.
- First-mount opens at the session title (no scroll-yank), confirmed on fresh load + resume.
- `npx tsc --noEmit` clean; `npx eslint` clean. The `active is not defined` console noise was
  confirmed **stale** (HMR artifact from the brief window the destructuring lagged the type —
  identical error set persisted on `/pray`, which never mounts the component).

## Git state at handoff
committed & pushed. Commits on `main`: `ee726b3` (tracker code), `61cf1ca` (pointer + test
plan), `5c9a172` + `aa71dc3` (testing convention/spinoff docs). Tree clean except untracked
`.claude/launch.json` (unrelated local scratch, intentionally excluded).

## Acceptance criteria — final (all met)
- [x] Current item visually prominent (NOW badge + ring; Guide highlight).
- [x] Completed prayers grayed out.
- [x] Auto-scrolls to the current/next item as you advance.
- [x] Tested in the running session view in `manual_done` mode.
- [x] Respects `prefers-reduced-motion` (smooth→auto via `matchMedia`).
- [x] Switching tabs lands on the current step (JC follow-up).

## Next (follow-ups, not blockers)
- **ACTS-92** — build the test harness, then backfill ACTS-76's planned unit/integration/E2E
  tests (flows E1/E2).
- **ACTS-89** — guided-prayer expand/collapse touches the same view; coordinate with the
  current-item highlight.
