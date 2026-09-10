---
id: ACTS-182
title: Collapse the Home Vessels card and move it last
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137, ACTS-177, ACTS-179]
started_at: 2026-09-09T17:13:36-0700
updated:    2026-09-09T17:13:36-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone on the Home page, I want the **Vessels** card collapsed by default and moved
to the **bottom** of the Home stack, so Home leads with prayer / Word / reflection and
Vessels stays available but out of the way.

## Context (why)
Home (`src/routes/index.tsx`) stacks its cards Prayer/Devotion → **Word** (C) →
**Vessels** (D, ~L872, the `SectionCard title={SECTION_LABEL}`) → **Reflection**. The
Vessels card is always expanded and sits above Reflection. JC wants it (a) **collapsible,
collapsed by default**, and (b) rendered **last**. `SectionCard`
(`src/components/home/SectionCard.tsx`) has **no collapse support today** — a
`Collapsible` primitive is already imported/available in `index.tsx` (L52).

## Acceptance criteria
- [ ] The Home Vessels card is **collapsible** via a header affordance (chevron) and is
      **collapsed by default**.
- [ ] The Vessels card renders **last** in the Home stack (below Reflection — confirm
      exact placement with JC).
- [ ] The card's contents (pinned Vessel/channel/link rows) are unchanged; the empty
      state still reads clearly.
- [ ] Collapse/expand persists across sessions (localStorage) — confirm with JC.

## Open questions for JC
- **Persist** the collapsed/expanded state across sessions, or always start collapsed?
- **Last** = below the Reflection composer, or last among the "content" cards but above
  Reflection?
- Add collapse as a **`SectionCard` option** (reusable) or one-off around the Vessels
  card only? (Prefer the reusable option if other cards will want it.)

## Tests
- **Unit**: N/A — presentational (no `src/lib/**` logic).
- **Integration**: render Home, assert the Vessels card is **last** and **collapsed** by
  default; toggle expands it and reveals the pinned rows; (if persisted) a remount keeps
  the chosen state. Planned (ACTS-92).
- **E2E**: extend the Home flow — Vessels appears last, collapsed; expanding shows pins.
  Planned.
