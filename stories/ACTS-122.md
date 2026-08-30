---
id: ACTS-122
title: Novena scaffold — generalize the block picker (chaplet slot + daily offerings)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-107]
relates_to: [ACTS-110, ACTS-121, ACTS-128]
started_at: null
updated:    2026-08-30T15:27:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone building a novena, I want the "Choose the parts" scaffold from ACTS-107 to be a
**general novena builder** — so any novena can be assembled from a rosary plus **a litany or
a chaplet**, with a daily offering that can vary by day — and so custom novenas can be built
on the same structure.

## Context (from JC, the ACTS-107 chat)
The ACTS-107 vigil proved the pattern: swappable `template_block` slots (`block_options`) +
loose opening/closing prayers. JC's direction to generalize it:
- **"A novena can have a litany OR a chaplet attached."** Add the **chaplet** as a swappable
  option alongside the litany — so a novena slot can be filled by rosary **and** chaplet, or
  rosary **and** litany. (St. Michael's novena — ACTS-128 — is chaplet-based; this unblocks it.)
- **"The box with the nested devotions can be called something generic to build novenas."**
  Rename the "Choose the parts" concept / block box to a generic **novena builder** framing.
- **"Daily offering prayers depending on day, or rotate each day."** Support an offering
  prayer that **changes by novena day** (day 1 vs day 2 …) or rotates through a set — the
  petition/offering that personalizes each day of the nine.

## Acceptance criteria (draft — refine in the chat)
- [ ] A novena slot can offer **chaplet** templates in `block_options` (not just litanies);
      the Session Builder picker lists them (e.g. Chaplet of St. Michael, Divine Mercy).
- [ ] The block-picker UI reads as a generic novena-part chooser (naming/labels).
- [ ] A mechanism for **day-varying offering prayers** — a prayer that resolves to the
      current novena day (Day N of 9), or rotates per day. Decide the data shape (day-keyed
      variants vs. a rotating list) as the structure firms up.
- [ ] Existing ACTS-107 novena still compiles/prays unchanged.
- [ ] STORAGE_KEY bumped; browser-verified.

## Tests
_Planned — no runner (ACTS-92)._
- **Unit**: compiler resolves a chaplet-filled slot; day-varying offering resolves to the right day.
- **Integration**: picker lists chaplet options; day offering shows Day N.
- **E2E**: N/A until harness.

## Notes
- Builds directly on ACTS-107's `block_options` + `compilePlanSession` (choice rides in
  `plan.items`). The day-offering piece likely needs the running series' "Day N of M" (see
  the daily-rosary/defer model, ACTS-99).
