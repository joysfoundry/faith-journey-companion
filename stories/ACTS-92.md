---
id: ACTS-92
title: Set up the test harness (Vitest + Testing Library + Playwright) — deferred
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-91, ACTS-76, ACTS-89, ACTS-78]
started_at:
updated: 2026-08-27T10:01:13-0700
latest_handoff: null
sessions: 0
---

## Goal
As the maintainer, I want a working test runner (unit, integration, and E2E) so the
per-story Tests sections we now document (the convention, [ACTS-91](ACTS-91.md)) can
actually **run** and gate releases.

_Deferred — to do at a later time. Spun off from [ACTS-91](ACTS-91.md) (the testing
convention, Done) so the convention could land without blocking on tooling._

## Acceptance criteria
- [ ] **Vitest** + `@testing-library/react` + `@testing-library/user-event` + `jsdom`/`happy-dom`
      installed and configured (Vite-native).
- [ ] Test setup mocks the browser seams we rely on: `scrollIntoView`, `matchMedia`,
      `localStorage` (the `STORAGE_KEY` store).
- [ ] **Playwright** installed for E2E, driving the dev server with seeded localStorage.
- [ ] `package.json` scripts: `test` (unit/integration), `test:e2e` (Playwright).
- [ ] One **smoke test per layer** proves the wiring: a unit test (e.g. `sessionProgress`),
      an integration test (render a route), and an E2E test (flow **E1** or **E2**).
- [ ] CI runs the suite on push (ties into the ACTS-78 publish flow).
- [ ] Backfill real tests for the stories whose Tests sections are currently "planned"
      (start with ACTS-76 tracker: flows **E1/E2**).

## Tests
- **Unit:** smoke — `sessionProgress` / a `recurrence` helper.
- **Integration:** smoke — render `/` (index) without crashing.
- **E2E:** smoke — flow **E1** or **E2** from [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md).

## Notes
- **Blocks executable coverage for every other story** — until this lands, the per-story
  Tests sections (standard via `_TEMPLATE.md`) stay "planned."
- Full flow catalog + tooling rationale: [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md).
- The convention that makes testing documented + tracked is [ACTS-91](ACTS-91.md) (Done).
- Brand-new work filed 2026-08-27, `.counter` → 92.
