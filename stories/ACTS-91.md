---
id: ACTS-91
title: Testing convention — tests documented + tracked as a task for every code change
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-92, ACTS-76, ACTS-89]
started_at: 2026-08-27T09:46:40-0700
updated: 2026-08-27T10:01:13-0700
latest_handoff: null
sessions: 0
---

## Goal
As the maintainer, I want testing to be a **documented, tracked part of every code
change going forward** — so no feature ships without its test coverage written down and
its testing work visible as a task, even before a runner exists.

_Refocused 2026-08-27 (JC): this story was originally "stand up the test harness." The
**convention** (document + track testing) is done now; the **actual harness build**
(installing Vitest/Playwright, wiring the runner) is deferred to **[ACTS-92](ACTS-92.md)**._

## Acceptance criteria
- [x] Every story pointer carries a **Tests** section (Unit · Integration · E2E) —
      enforced by [`stories/_TEMPLATE.md`](_TEMPLATE.md), so all future stories include it.
- [x] The **process is documented** — ledger Process rule (testing applies to every story)
      + board note in [`stories/README.md`](README.md).
- [x] A shared **E2E flow catalog** exists to build against: [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md).
- [x] Testing is a **tracked task**, not just prose: while no runner exists, coverage is
      documented as **planned** and the harness build is its own task ([ACTS-92](ACTS-92.md));
      once the harness lands, stories carry real tests.
- [x] Active stories updated to the convention (ACTS-76 filled in, ACTS-89 stubbed).

## Tests
_This story is the testing **convention/documentation** — no runtime code, so no runtime
tests. The executable harness that lets other stories' Tests sections run is [ACTS-92](ACTS-92.md)._

## Notes
- The convention: a code-change story **documents** its tests (Tests section) **and** its
  testing work is **tracked** — as planned coverage now, as real tests once ACTS-92 lands.
- Handed the harness build to [ACTS-92](ACTS-92.md) (deferred, "at a later time").
