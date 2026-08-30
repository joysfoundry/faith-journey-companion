---
id: ACTS-109
title: Surface "Pray with the Pope" on Home as a daily session option
spine: ACTS-109
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-10]
started_at: 2026-08-29T21:25:05-0700
updated:    2026-08-29T21:25:05-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user, I want **Pray with the Pope** reachable from Home as a startable daily
session, so I can pray the Pope's monthly intention without hunting for it.

## Context
From the v8↔code gap review (JC: "i see it seeded in prayers. we can add it to the
home page as daily session."). **Correction to the gap table:** the template *is*
seeded — `tpl-pray-with-pope` / `popeItems` in `src/lib/prayer/seed.ts` (External
Link → vaticannews prayer-intentions). So this is **not** a reseed; it's surfacing
it on Home. PRD v8 §25E. The seeded template is intentionally just the External Link;
users can customize a Session from it.

## Acceptance criteria (draft)
- [ ] Pray with the Pope appears as a startable option on Home / Today's Devotions (like a daily prayer)
- [ ] Optional to enable/select (does not force it into the daily routine)
- [ ] Starting it opens the external prayer experience (default link) or a customized session if the user added components
- [ ] Confirm the vaticannews link is current

## Tests
- **Integration**: Home shows the Pray-with-the-Pope option when enabled; start → external link action.
- **E2E**: enable it on Home → start → lands on the external prayer experience.
