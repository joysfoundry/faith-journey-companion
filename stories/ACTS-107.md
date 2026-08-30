---
id: ACTS-107
title: Litany of the Departed devotion (Rosary + Litany structure)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: [ACTS-106]
relates_to: [ACTS-57, ACTS-106, ACTS-110]
started_at: 2026-08-29T22:05:00-0700
updated:    2026-08-29T22:05:00-0700
latest_handoff: null
sessions: 0
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
CLOSINGS     collect(s) [Fidelium, etc.] · (opt) Sacred Heart / Mt Carmel / Perpetual Help
             · (opt) Salve · Eternal Rest versicle
CLOSE        Sign of the Cross · (opt) reading/poem
```

**Key facts settled in session-01:**
- The **Decade of the Passion** is **not** a pre-offering prayer and does **not** run
  alongside a standard rosary — it **replaces** it. It's a bead-counted "Rosary for the
  Dead" and is **one selectable rosary version**. Seed it like a rosary (reuse the
  mystery/compiler machinery); add a How-To (ACTS-28 auto-howto + our technical notes).
- The **name + pronoun layer** is intrinsic: the OLG content carries `N.` and `her/him`
  literally. Choosing Loreto for a named soul flips every "pray for us" → "pray for her".
- Litanies already seeded: Humility, Sacred Heart, Immaculate Heart of Mary (+ St Michael
  chaplet). **Loreto/BVM and Faithful Departed are NOT seeded** — both new.
- Closing collects (Fidelium "O God, Creator and Redeemer…"; the parents/kindred collect)
  are **standalone reusable prayers**, pulled in as components — not baked into the litany.

## Proposed story map (feeds this composite)
| Piece | Story |
|---|---|
| Template Block / nesting infra | **ACTS-110** (build first) |
| Decade of the Passion / Rosary for the Dead + How-To | new seed story (proposed) |
| Litany of the Faithful Departed (generic) + Litany of Loreto/BVM | new seed story (proposed) |
| Closing collects as standalone prayers | new seed story (proposed, or fold here) |
| Name + pronoun layer (session "for whom" + compiler substitution) | new story (proposed) |
| **The composite devotion** (assemble all) | **ACTS-107** (this story) |

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
