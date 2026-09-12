---
id: ACTS-198
title: Devotion Builder — add a "From an existing devotion" How (start from one you already have)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-190, ACTS-176, ACTS-107]
started_at: 2026-09-12T09:55:04-0700
updated:    2026-09-12T09:55:04-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone building a devotion, I want a **"From an existing devotion"** option under **How?** on
the Devotion Builder — so I can start from a devotion I already have (duplicate/adapt its steps)
instead of rebuilding by hand, then review and save it as a new devotion.

JC (2026-09-12): "spinoff story on devotion builder page — add a How: from existing devotion."

## Context (where it lands)
The Devotion Builder is [`src/routes/import.tsx`](../src/routes/import.tsx). The **How?** choices
for a devotion are `DEVOTION_HOWS` (line ~91): `By hand` (`manual`), `Paste text` (`paste`),
`From a link` (`url`), `From a photo` (`photo`) — rendered by the `Segmented` control; `How` is a
string-union type (line 84). Adding a mode = extend the `How` union + `DEVOTION_HOWS`, then a branch
in the builder body that, for `existing`, shows a **devotion picker** (existing `PrayerTemplate`s)
and seeds the editable draft from the chosen devotion's steps.

## Behavior (proposed — to design)
1. New How **`existing`** ("From an existing devotion"), shown for `what === "devotion"` (probably
   not for a single prayer — TBD).
2. Pick a devotion from the library (the same list the app already renders for templates); on pick,
   **prefill the "By hand" devotion editor** with a copy of its steps/segments so the user edits a
   fresh draft — the original is untouched.
3. Save as a **new** devotion (a distinct `PrayerTemplate`), not an alternate version of the
   original — unless we decide otherwise.

## Open questions for JC
- **Copy vs alternate version:** does "from existing" always mint a brand-new devotion, or offer
  "save as a new version of this one" too? (Mystery/version model exists — see ACTS-176.)
- **Single prayers:** offer "from an existing prayer" as well, or devotion-only for now?
- **Reuse:** is there already a "duplicate devotion/template" path elsewhere (prayers list /
  template detail) we should route through instead of a parallel one?
- **Scope of edit:** land straight in the full drag-and-drop `manual` editor pre-filled, or a
  lighter "pick then tweak" step first?

## Tests
No runner yet (ACTS-92). **Unit:** a helper that clones a `PrayerTemplate` into an editable draft
(new ids, steps preserved). **Integration:** choosing "From an existing devotion" → picking one
prefills the editor with its steps; saving creates a new devotion without mutating the original.
**E2E:** Devotion Builder → How "From an existing devotion" → pick → edit a step → save → new
devotion appears in the library, original unchanged. Planned.
