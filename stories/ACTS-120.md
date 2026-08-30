---
id: ACTS-120
title: Seed — Litany of the Faithful Departed + Litany of Loreto/BVM + closing collects
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-57, ACTS-121]
started_at: null
updated:    2026-08-29T22:39:08-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone leading prayers for the dead, I want the **Litany of the Faithful Departed** and the
**Litany of Loreto (BVM)** seeded (plus the closing collects), so a departed devotion can use
either litany body and string the concluding prayers.

## Context
Reuses the litany model ([[litany-model]], ACTS-57: `salutation` items, call = label,
refrain = body; **per-item refrain**, confirmed with JC). Two new litanies:
- **Litany of the Faithful Departed** (generic "them") — <https://www.catholicdoors.com/prayers/litanies/p03468.htm>.
  Refrain shifts by section (have mercy on… → pray for… → deliver them, O Lord → we beseech
  Thee, hear us → grant unto them eternal rest).
- **Litany of Loreto / BVM** — <https://nashvilledominican.org/prayer/litanies/litany-of-the-blessed-virgin-mary/>.
  NOT currently seeded (we have Humility, Sacred Heart, Immaculate Heart of Mary). When used for
  a named soul, "pray for us" → "pray for {them}" via the name/pronoun layer (ACTS-121).

**Closing collects as standalone reusable prayers** (not baked into the litany): the **Fidelium**
("O God, the Creator and Redeemer of all the faithful…") and the parents/kindred collect
("O eternal God, Who… hast commanded a particular respect for parents, kindred, and
benefactors…"). Both public-domain.

## Acceptance criteria (draft)
- [ ] Litany of the Faithful Departed seeded (generic "them"), section refrains correct.
- [ ] Litany of Loreto/BVM seeded, full invocation list, "pray for us/them" refrains.
- [ ] Closing collects seeded as standalone `Prayer` records with sources.
- [ ] All searchable/prayable in the library; `STORAGE_KEY` bumped; browser-verified.
- [ ] Name/pronoun placeholders where a soul is addressed (renders "them" when blank; ACTS-121).

## Tests
_Planned — no runner (harness = ACTS-92); document per ACTS-91._
- **Unit** (Vitest): assert both litany templates + the collects present with expected items.
- **Integration**: library lists/searches them; Pray mode advances the salutations.
- **E2E**: pray a litany to completion. N/A until harness lands.

## Notes
- Feeds **ACTS-107** (composite). Loreto/BVM is the "us→person" case for ACTS-121.
