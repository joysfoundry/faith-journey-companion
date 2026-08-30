---
id: ACTS-107
title: Litany of the Departed devotion (Rosary + Litany structure)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-106]
relates_to: [ACTS-57, ACTS-106]
started_at: null
updated:    2026-08-29T18:44:53-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone leading prayers for a deceased loved one (e.g. the days after a passing), I want a
seeded **Litany of the Departed** devotion that combines a **Rosary + Litany** in the order my
family prays it, so I can pray it — or share a follow-along link — without making a paper
pamphlet.

## Structure (to be worked in the next chat — JC will provide exact wording)
A composite devotion = **Rosary + Litany**, in sequence:
1. **Offering / Invitation** — opening offering + invitation to prayer.
2. **Litany sequence** — call/response salutation items (reuse the litany model from
   ACTS-57: call = label, refrain = body).
3. **Closing / Requiem prayers** — concluding prayers for the dead.
4. **Eternal Rest Prayer** — the seeded prayer from **ACTS-106**.
5. **Sign of the Cross** — close.

The Rosary portion should reuse the existing Rosary/mystery + compiler machinery; the litany
portion reuses the seeded-litany model ([[litany-model]], ACTS-57). This is a **new devotion
of `devotion_type` mixing `rosary` + `litany`** — confirm how the builder/compiler represents
a composite devotion (may need a small extension).

## Acceptance criteria (draft — refine once wording is in)
- [ ] "Litany of the Departed" exists as a seeded devotion with the 5-part structure above, in order.
- [ ] The litany sequence renders as salutation call/refrain items (per ACTS-57).
- [ ] The Eternal Rest Prayer (ACTS-106) is reused, not re-authored.
- [ ] Prayable end-to-end in guided Pray mode; expands repetitions correctly.
- [ ] Shareable as a follow-along link (guests can pray along).
- [ ] Source/provenance recorded; `STORAGE_KEY` bumped.
- [ ] Browser-verified.

## Tests
_Planned — no runner wired (harness = ACTS-92); document per ACTS-91._
- **Unit**: compiler expands the composite (rosary decades + litany items + closing) in the right order.
- **Integration**: devotion detail renders all 5 parts; Pray mode advances through them.
- **E2E**: pray the Litany of the Departed to completion. N/A until harness lands.

## Notes
- Filed via `/spinoff` as a **parked stub** — the full structure + exact prayer wording is
  next-chat work. Clean to `/start ACTS-107`.
- Depends on **ACTS-106** (Eternal Rest Prayer seed). Relates to **ACTS-57** (seeded litanies).
