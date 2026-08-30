---
id: ACTS-120
title: Seed — Litany of the Faithful Departed + Litany of Loreto/BVM + closing collects
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-57, ACTS-121]
started_at: 2026-08-30T07:45:00-0700
updated:    2026-08-30T08:28:27-0700
latest_handoff: ACTS-120/session-01.md
sessions: 1
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

## Acceptance criteria
- [x] Litany of the Faithful Departed seeded (`tpl-litany-faithful-departed`, generic plural "the
      faithful departed / them"); section refrains correct (have mercy on… → pray for… → deliver
      them → we beseech Thee, hear us → grant unto them eternal rest). — [seed.ts](../src/lib/prayer/seed.ts) `litanyFaithfulDepartedItems`. 52 salutations.
- [x] Litany of Loreto/BVM seeded (`tpl-litany-loreto`); **50 Marian invocations** Holy Mary →
      Queen of Peace + Trinity + Lamb of God + versicle + closing collect; general "pray for us"
      refrain. Distinct from the already-seeded Immaculate-Heart litany.
- [x] Closing collects seeded as standalone `Prayer` records with sources — `collect-fidelium`
      + `collect-departed-kindred` (both `src-catholicdoors-departed`); **not** baked into the litany.
- [x] All searchable/prayable in the library; `STORAGE_KEY` v31→**v32**; browser-verified (both
      litanies render the full arc, no console errors).
- [~] Name/pronoun placeholders — **deferred to ACTS-121 by design.** Faithful Departed uses the
      generic plural; Loreto uses the general "pray for us" (adapted to "her/them" for a dedicated
      departed session by ACTS-121/107). Both render correctly standalone now.

## Tests
_No runner (harness = ACTS-92). **Unit coverage exercised** via a Node harness against the real
`createSeedDatabase()` + compiler:_
- **Unit** — both templates + both sources + both collects seeded; Faithful Departed opens Kyrie,
  Trinity, saints intercession (plural-departed refrain), deliverance + closing versicles, collects
  NOT in the litany body; Loreto full arc Holy Mary → Queen of Peace (**50 invocations, verified
  directly**), "pray for us" refrain, Lamb of God + closing collect; Loreto ≠ Immaculate-Heart.
- **Integration** — browser (v32 reseed): `/devotion/tpl-litany-faithful-departed` and
  `/devotion/tpl-litany-loreto` render the full ordered structure; **no console errors**.
- **E2E** — pray a litany to completion. N/A until harness lands.

## Known follow-ups
- ACTS-121 tokenizes the departed refrains + adapts Loreto "us"→"her/them" for a named soul.
- ACTS-107 assembles: Rosary-for-the-Dead block (ACTS-119) → Litany block (this) → closing collects
  (`collect-fidelium`, `collect-departed-kindred`) → Eternal Rest → Sign of the Cross.

## Notes
- Feeds **ACTS-107** (composite). Loreto/BVM is the "us→person" case for ACTS-121.
