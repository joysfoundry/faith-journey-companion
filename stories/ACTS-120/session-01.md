---
story: ACTS-120
session: 01
wrapped_at: 2026-08-30T08:28:27-0700
status: In Progress
final: false
---

## What happened
Seeded the two litanies + the closing collects the Litany-for-the-Dead composite needs.

- **Litany of the Faithful Departed** (`tpl-litany-faithful-departed`, `litanyFaithfulDepartedItems`)
  — catholicdoors source. Kyrie → Trinity (have mercy on the souls of the faithful departed) →
  saints intercession (pray for the souls…) → Be merciful → deliverance block (O Lord, deliver
  them) → beseech-Thee block → Lamb of God (grant unto them eternal/rest everlasting) → closing
  versicles (From the gate of hell… / O Lord, hear my prayer…). 52 salutations. Generic plural
  throughout.
- **Litany of Loreto / BVM** (`tpl-litany-loreto`, `litanyLoretoItems`) — Vatican source. Kyrie →
  Trinity → **50 Marian invocations** Holy Mary → Queen of Peace (general "pray for us") → Lamb of
  God (`LAMB_OF_GOD` helper) → "Pray for us, O holy Mother of God" versicle → closing collect.
  Not previously seeded (distinct from the Immaculate-Heart litany).
- **Closing collects** as standalone `Prayer` records (not baked into the litany):
  `collect-fidelium` ("O God, the Creator and Redeemer…") + `collect-departed-kindred`
  ("O eternal God, Who… parents, kindred, and benefactors…"). Both `src-catholicdoors-departed`.
- **Sources** `src-catholicdoors-departed`, `src-loreto`. **STORAGE_KEY** v31 → **v32**.

**Design (consistent with ACTS-119):** litanies seeded in their **generic** forms — Faithful
Departed plural "the faithful departed / them"; Loreto general "pray for us". ACTS-121 tokenizes /
adapts "us → her/them" for a name-dedicated departed session.

## Verified (and how)
- `tsc --noEmit` clean.
- **Compile harness** (`node --experimental-strip-types`, scratchpad `seed-120-test.ts`) against the
  real `createSeedDatabase()` + compiler — all real assertions pass: both templates + sources +
  collects seeded; FD structure (Kyrie/Trinity/saints/deliverance/closing) with plural-departed
  refrain, collects NOT in the litany body; Loreto full arc + "pray for us" + Lamb of God + closing
  collect; Loreto ≠ Immaculate Heart. Direct count confirmed **Loreto = 50 Marian invocations**
  (Holy Mary → Queen of Peace); FD = 52 salutations. (One harness assertion used a loose regex that
  also matched "Holy Trinity" → reported 51; the direct count proves 50.)
- **Browser** (localhost:8080, v32): both litany devotion pages render the full ordered structure;
  **no console errors**. Note: a mid-edit HMR reseed had persisted a stale `v32` — cleared the
  `prayer-companion-db-*` localStorage keys to force a clean reseed (dev-only; real users bump clean).

## Git state at handoff
Uncommitted — not `/save`d. Changed: `src/lib/prayer/seed.ts`, `src/lib/prayer/store.ts`;
docs: `stories/ACTS-120.md`, this handoff.

## Next
- `/save` ACTS-120, then **ACTS-121** (name + pronoun layer): session "for whom" (name + pronoun)
  + compiler token substitution; retrofit the ACTS-119/120 generic text with tokens.
- Then **ACTS-107**: assemble the composite via ACTS-110 blocks.
