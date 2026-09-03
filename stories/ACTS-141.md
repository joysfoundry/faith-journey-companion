---
id: ACTS-141
title: Don't leave empty Lectio sessions behind when Begin is abandoned
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-138, ACTS-102, ACTS-140]
started_at: 2026-09-03T12:33:01-0700
updated: 2026-09-03T12:33:01-0700
latest_handoff: null
sessions: 0
---

## Goal
As a person who taps "Begin" on a Lectio and then backs out, I don't want an **empty,
abandoned Lectio session** left in my data — it clutters lists (it surfaced in the
reflection link picker before ACTS-138 excluded it) and would litter the Journal's
sitting view (ACTS-140).

## Why — the gap
`startLectio` (and every launcher) calls `startSession(LECTIO_TEMPLATE_ID, …)`, which
**creates and persists a session record immediately** ([`app-store-provider.tsx`](../src/components/app-store-provider.tsx)
→ `mutations.startSession`). If the user never journals a movement and leaves, that empty
session persists in `db.sessions` forever. Tapping Begin a few times over a few days
accumulates empty "Lectio Divina" sessions. Found while shipping ACTS-138 (multiple empty
sittings appeared in the picker).

## Design — options to weigh with JC
- **A. Create lazily** — don't persist the session until the first meaningful action
  (first journaling save, or first movement completed). Cleanest, but touches the launch/
  player contract and must not break resume or the passage-set step.
- **B. Prune empties** — keep eager creation, but treat a Lectio session with **zero linked
  reflections and no progress** as disposable: drop it on close/abandon, or sweep such
  empties (e.g. on app load / when building lists). Lower-risk, more surgical.
- Decide scope: Lectio-only (the surface that exposed this) vs. all templates (a rosary
  opened-and-abandoned has the same shape, but is arguably less noisy).

Lean **B, Lectio-scoped** first unless JC wants the general fix. Confirm "empty" =
no `reflections` linked to the session **and** no completed steps.

## Acceptance criteria
- [ ] Tapping Begin and leaving without journaling does not leave a persisted Lectio
      session behind (or it is pruned promptly).
- [ ] A Lectio with any journaling / progress is preserved and resumable (no data loss).
- [ ] The reflection picker and the Journal sitting view (ACTS-140) never show an empty
      sitting.
- [ ] Decision recorded: lazy-create vs. prune, and Lectio-only vs. all templates.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): the chosen mutation — a started-but-empty Lectio session is absent
  after abandon/prune; a session with ≥1 linked reflection or a completed step survives.
- **Integration** (Testing Library): Begin → immediately leave → assert no new session in
  the store (or it's gone after the prune trigger); Begin → journal one movement → leave →
  the session remains.
- **E2E** (Playwright): Begin a Lectio, navigate away without journaling → it isn't listed;
  Begin + journal → it is, and resumes.
