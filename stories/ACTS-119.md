---
id: ACTS-119
title: Seed — Decade of the Passion (Rosary for the Dead) + How-To
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-110, ACTS-121, ACTS-28]
started_at: null
updated:    2026-08-29T22:39:08-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying for the dead, I want the **Decade of the Passion / Rosary for the Dead**
seeded as a selectable **rosary version**, so I can pray the Passion-focused bead devotion
(and share a follow-along) instead of the standard rosary.

## Context
Filipino *Pasiyam* custom. It **replaces** the standard rosary — same physical beads, proper
prayers: large (Our Father) bead = "O Most Merciful Jesus, look down…"; the 10 small (Hail
Mary) beads = 10 Passion sufferings (call → "Have mercy on the soul of {name}"). Fixed to the
**Sorrowful Mysteries** for all 9 days. **Decision (JC, session-01 of ACTS-107): the 10
sufferings repeat identically in all 5 decades** (50 bead-lines), mystery announced per decade.
Exact wording captured in [ACTS-107.md](ACTS-107.md) → "Captured source content".

## Acceptance criteria (draft)
- [ ] Seeded as a `rosary`-kind template reusing the mystery/compiler machinery; pinned to the
      Sorrowful set.
- [ ] Preparation prayer once at the start.
- [ ] Each decade: mystery announced → large-bead "Merciful Jesus" prayer → 10 suffering
      salutations (call/response) → Eternal Rest versicles.
- [ ] 10 sufferings repeat in all 5 decades (per JC decision).
- [ ] Name/pronoun placeholders used in the seed text (depends on ACTS-121 for substitution;
      renders "the faithful departed / them" when blank).
- [ ] How-To attached (ACTS-28 auto-howto + our technical notes on the bead mapping).
- [ ] Source recorded (OLG); `STORAGE_KEY` bumped; browser-verified.

## Tests
_Planned — no runner (harness = ACTS-92); document per ACTS-91._
- **Unit** (Vitest): compiler expands the Decade of the Passion — 5 decades × (1 large-bead +
  10 salutations + Eternal Rest); Sorrowful mysteries in order.
- **Integration**: devotion detail + Pray mode advance through all beads.
- **E2E**: pray the Rosary for the Dead to completion. N/A until harness lands.

## Notes
- Content source: OLG "Novena for One Who Has Died". Feeds **ACTS-107** as a rosary version.
- Name/pronoun substitution is **ACTS-121**; seed with placeholders so it degrades gracefully.
