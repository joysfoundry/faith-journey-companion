---
id: ACTS-107
title: Novena — 9-Day Rosary for the Faithful Departed (swappable rosary/litany)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: [ACTS-106]
relates_to: [ACTS-57, ACTS-106, ACTS-110, ACTS-119, ACTS-120, ACTS-121]
started_at: 2026-08-30T10:30:00-0700
updated:    2026-08-30T15:27:00-0700
latest_handoff: stories/ACTS-107/session-01.md
sessions: 1
---

## Goal
As someone leading prayers for a deceased loved one (e.g. the days after a passing), I want a
seeded **Litany of the Departed** devotion that combines a **Rosary + Litany** in the order my
family prays it, so I can pray it — or share a follow-along link — without making a paper
pamphlet.

## Structure (worked with JC over session-01 — sources gathered, model settled)
A composite **"Litany for the Faithful Departed"** devotion, assembled from reusable
**Template Blocks** (ACTS-110). One shared grammar across all the examples JC gave
(Aurora novena, catholicdoors litany, OLG novena):

```
OPENING      Sign of the Cross · (Act of Contrition / intro) · Eternal Rest versicle
ROSARY       ── choose the version ──
             • Standard Rosary (mystery set by day / fixed)            [exists]
             • Decade of the Passion / Rosary for the Dead             [new seed + How-To]
(opt) OFFERING / INVITATION   "O Jesus, crowned with thorns… lead the soul of {name}…"
LITANY       ── choose the body ──
             • Litany of the Faithful Departed (generic "them")        [new seed]
             • Litany of Loreto / BVM (adapted her/them)               [new seed]
             • any other seeded litany
CLOSING BLOCK  (closing & requiem prayers) — the concluding section, a Template Block:
             collect(s) [the Fidelium + kindred collects] · (opt) Sacred Heart / Mt Carmel /
             Perpetual Help · (opt) Salve · Eternal Rest versicle
CLOSE        Sign of the Cross · (opt) reading/poem
```

**Key facts settled in session-01:**
- The **Decade of the Passion** is **not** a pre-offering prayer and does **not** run
  alongside a standard rosary — it **replaces** it. It's a bead-counted "Rosary for the
  Dead" and is **one selectable rosary version**. Seed it like a rosary (reuse the
  mystery/compiler machinery); add a How-To (ACTS-28 auto-howto + our technical notes).
- The **name + pronoun layer** is intrinsic: the OLG content carries `N.` and `her/him`
  literally. Choosing Loreto for a named soul flips every "pray for us" → "pray for her".
- Litanies: Humility, Sacred Heart, Immaculate Heart of Mary (+ St Michael chaplet) were
  already seeded; **Loreto/BVM and Faithful Departed are now seeded too** (ACTS-120).
- Closing collects (Fidelium "O God, Creator and Redeemer…"; the parents/kindred collect)
  are **standalone reusable prayers** (`collect-fidelium`, `collect-departed-kindred`), pulled
  in as components — not baked into the litany.

## Building blocks — ALL DONE (ready to assemble)
Every dependency this composite needs is built, verified, and committed. This story is now
purely **assembly**.

| Piece | Story | Status | What to reuse (ids) |
|---|---|---|---|
| Template Block / nesting infra | **ACTS-110** | ✅ code-complete | `template_block` item kind + `block_template_id`; compiler recurses (cycle guard, `MAX_BLOCK_DEPTH`, `source_template_id` lineage); builder "Devotion block" add-type |
| Decade of the Passion (Rosary for the Dead) + How-To | **ACTS-119** | ✅ seeded | template `tpl-rosary-for-the-dead`; prayers `passion-preparation`, `merciful-jesus-look-down`; `howto-rosary-for-the-dead` |
| Litany of the Faithful Departed + Loreto/BVM + collects | **ACTS-120** | ✅ seeded | `tpl-litany-faithful-departed`, `tpl-litany-loreto`; collects `collect-fidelium`, `collect-departed-kindred` |
| Name + pronoun dedication | **ACTS-121** | ✅ built | `SessionContext.for_whom` + `substituteDedication` tokens `{name}{subj}{obj}{poss}{us}`; builder "Prayed for" field |
| **The composite devotion** (assemble) | **ACTS-107** | ← this story | Eternal Rest = `eternal-rest` (ACTS-106); Sign of the Cross = `sign-of-the-cross` |

## Assembly brief (for the fresh chat that starts ACTS-107)
Build a new **composite template** — the "Litany for the Faithful Departed" — using **ACTS-110
Template Blocks** (a `template_block` item references another template by `block_template_id`;
the compiler expands it inline). Proposed structure, top to bottom:

1. **Opening** — `sign-of-the-cross`, optional intro, `eternal-rest`. (The Decade block already
   opens/closes with Sign of the Cross — **de-dupe**: either drop the block's frames or the
   opening's, so the Cross isn't prayed twice back-to-back.)
2. **Rosary** — a `template_block` → **`tpl-rosary-for-the-dead`** (the Decade of the Passion).
3. **(opt) Offering** — a prayer/salutation item (Aurora/OLG have it; catholicdoors doesn't).
4. **Litany** — a `template_block` → **`tpl-litany-faithful-departed`** (default) or
   **`tpl-litany-loreto`** (swap for a Marian family favorite; its `{us}` becomes "her/them"
   once the session is dedicated).
5. **Closing block** (closing & requiem prayers) — `collect-fidelium` + `collect-departed-kindred`
   (both `collect-*` are the *type*; the **block** is the "Closing block"), optional Salve, then
   `eternal-rest`.
6. **Close** — `sign-of-the-cross` (+ optional reading; the "I Am Free" poem needs a copyright
   check before seeding — likely omit).

Then: seed it as a devotion (own id, e.g. `tpl-litany-for-the-dead`), record its source, **bump
`STORAGE_KEY` (v33 → v34)**, and browser-verify:
- Dedicate a session to a named soul (builder "Prayed for" → e.g. "Grandma Aurora / she") and
  confirm Pray mode reads "the soul of Grandma Aurora", "grant unto her…", Loreto "pray for her".
- Leave it blank and confirm the generic "the faithful departed / them / us" reading.
- Generate a **follow-along share** and confirm the dedication rides along (share encodes the
  compiled, already-substituted items — ACTS-121).

**Verify approach with no test runner:** the Node harness pattern used all session
(`node --experimental-strip-types` importing `createSeedDatabase()` + `generatePrayerSession`)
is the fastest way to assert the composite compiles in order with the right dedication — see
`stories/ACTS-119/session-01.md` and `ACTS-121/session-01.md`.

## Captured source content — Decade of the Passion (OLG), exact wording
Sorrowful Mysteries, fixed for all 9 days: Agony in the Garden · Scourging at the Pillar ·
Crowning with Thorns · Carrying of the Cross · Crucifixion & Death.

**Preparation (once, at start):** "Lord, open our lips and inflame our hearts and cleanse
them of useless and evil thoughts. Enlighten our minds that we may seriously meditate on
Your suffering and death, and the pains endured by Your mother. Hear and receive us before
Your great majesty, for you who live and reign forever and ever. Amen."

**Our Father bead (each decade):** "O Most Merciful Jesus, look down with eyes of pity on the
faithful souls for whom You suffered and died on the Cross."

**Hail Mary beads (each decade — 10 sufferings, R. "Have mercy on the soul of {name|N.}"):**
1. through your bloody sweat in the garden
2. through the blow You received on Your Sacred Face
3. through the cruel scourging You endured
4. through the crown of thorns that pierced Your head
5. through Your carrying of the Cross on the path of bitterness
6. through Your face covered with blood which You allowed to be imprinted on Veronica's veil
7. through Your bloody garments that were cruelly removed from Your wounded Body
8. through Your Holy Body nailed on the Cross
9. through Your Hands and Feet pierced with cruel nails
10. through Your Sacred side pierced with the lance, from which flowed blood and water

**Decade close (versicles):** V. Eternal rest grant unto {her/him/them}, O Lord. / R. And let
perpetual light shine upon {her/him/them}. / V. May {s/he/they} rest in peace. / R. Amen.
_Decision (JC): repeat the 10 sufferings identically in all 5 decades (50 bead-lines)._

## Sources given by JC (session-01)
- Aurora novena (`~/Downloads/Aurora_Novena.md`) — Loreto adapted to a named soul (Pasiyam).
- Litany of the Faithful Departed — <https://www.catholicdoors.com/prayers/litanies/p03468.htm>
- OLG "Novena for One Who Has Died" — <https://olg.cc/liturgy/devotions-liturgical-seasons/novena-for-one-who-has-died/>
- Litany of the BVM (Loreto) — <https://nashvilledominican.org/prayer/litanies/litany-of-the-blessed-virgin-mary/>

## Acceptance criteria
- [x] "Litany for the Faithful Departed" exists as a seeded devotion (`tpl-litany-for-the-dead`)
  with the 5-part structure above, in order — assembled from 3 nested Template Blocks
  (rosary-for-the-dead · litany-faithful-departed · closing-requiem) framed by Sign/Eternal Rest.
- [x] The litany sequence renders as salutation call/refrain items (per ACTS-57) via the nested block.
- [x] The Eternal Rest Prayer (ACTS-106) is reused (`eternal-rest`), not re-authored.
- [x] Prayable end-to-end in guided Pray mode; expands to 132 steps in order.
- [x] Shareable as a follow-along link — the share codec (`toShareItem`/`buildSharePayload`) copies
  the compiled, already-substituted item title/body verbatim, so the dedication rides along.
- [x] Source/provenance recorded (`src-olg-passion`); `STORAGE_KEY` bumped v33 → v34.
- [x] Browser-verified (dedicated "Grandma Aurora / she" + blank generic; harness + live Pray mode).

## Tests
_Planned — no runner wired (harness = ACTS-92); document per ACTS-91._
- **Unit**: compiler expands the composite (rosary decades + litany items + closing) in the right order.
- **Integration**: devotion detail renders all 5 parts; Pray mode advances through them.
- **E2E**: pray the Litany of the Departed to completion. N/A until harness lands.

## Notes
- Filed via `/spinoff` as a **parked stub** — the full structure + exact prayer wording is
  next-chat work. Clean to `/start ACTS-107`.
- Depends on **ACTS-106** (Eternal Rest Prayer seed). Relates to **ACTS-57** (seeded litanies).
