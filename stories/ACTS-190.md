---
id: ACTS-190
title: Home Prayer & Devotion ⋯ menu — add "New prayer" item
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-182, ACTS-173]
started_at: 2026-09-10T14:29:48-0700
updated:    2026-09-10T14:29:48-0700
latest_handoff: ACTS-190/session-01.md
sessions: 1
---

## Goal
As someone on Home, I want the **Prayer & Devotion** block's ellipsis (⋯) menu to also offer
**"New prayer"**, so I can create a prayer straight from Home — not only start a "New session".

JC (2026-09-10):
> For home prayer and devotion ellipse menu add item + new prayer.

## Context
The Home **Prayer & Devotion** card (block A, `src/routes/index.tsx` ~L627) has a header
`MoreVertical` (⋯) `DropdownMenu` whose only item today is **"New session"** (`Plus` →
`navigate({ to: "/pray", search: { build: true } })`, ~L656). This story adds a second item,
**"New prayer"**, that opens the create-a-prayer flow. (A prayer/devotion is a
`PrayerTemplate`; existing add surfaces include `/prayers` and `/import` "Add prayers".)

## Decision (JC, 2026-09-10)
"New prayer" lands on the **Devotion Builder as a single prayer** — reuse the existing wiring
from the `/prayers` ⋯ menu: `navigate({ to: "/import", search: { mode: "single" } })`
(`src/routes/prayers.tsx:582`). No new form to build.

## Acceptance criteria
- [x] The Prayer & Devotion ⋯ menu shows a **"New prayer"** item (`Plus` icon), alongside the
      existing "New session".
- [x] Choosing it navigates to **`/import?mode=single`** (the Devotion Builder, single-prayer
      mode) — same destination as the `/prayers` page's "New prayer".
- [x] "New session" is unchanged; labels read clearly (distinguish *session* vs *prayer*).

## Tests
No runner yet (ACTS-92). **Integration:** the ⋯ menu renders "New prayer"; clicking it routes
to `/import?mode=single`. **E2E:** Home → New prayer → Devotion Builder. Planned.
