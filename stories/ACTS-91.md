---
id: ACTS-91
title: Stand up the test harness (Vitest + Testing Library + Playwright)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-76, ACTS-89, ACTS-78]
started_at:
updated: 2026-08-27T09:46:40-0700
latest_handoff: null
sessions: 0
---

## Goal
As the maintainer, I want a working test harness (unit, integration, and E2E) so that the
per-story test plans we've started documenting can actually run and gate releases.

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

## Tests
_This story **is** the test infra — its own "tests" are the smoke tests above._
- **Unit:** smoke — `sessionProgress` / a `recurrence` helper.
- **Integration:** smoke — render `/` (index) without crashing.
- **E2E:** smoke — flow **E1** or **E2** from [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md).

## Notes
- Blocks executable coverage for every other story — the per-story **Tests** sections
  (now standard in `_TEMPLATE.md`) stay "planned" until this lands.
- Full flow catalog + tooling rationale: [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md).
- Brand-new work filed 2026-08-27 (ACTS-76 session), `.counter` → 91.
