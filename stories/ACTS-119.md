---
id: ACTS-119
title: Seed — Decade of the Passion (Rosary for the Dead) + How-To
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-110, ACTS-121, ACTS-28]
started_at: 2026-08-30T00:00:00-0700
updated:    2026-08-30T07:41:44-0700
latest_handoff: ACTS-119/session-01.md
sessions: 1
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

## Acceptance criteria
- [x] Seeded as a `rosary`-kind template (`tpl-rosary-for-the-dead`) reusing the mystery/compiler
      machinery; pinned to `set-sorrowful`, `title_only` presentation. — [seed.ts](../src/lib/prayer/seed.ts) `rosaryForDeadItems()`.
- [x] Preparation prayer once at the start (`passion-preparation`) + large-bead `merciful-jesus-look-down`.
- [x] Each decade: mystery announced → large-bead "Merciful Jesus" → 10 suffering salutations
      (call = "My Jesus, …", response) → Eternal Rest (`eternal-rest`, ACTS-106).
- [x] 10 sufferings repeat in all 5 decades — **50 verified** in the compile harness.
- [~] Name/pronoun placeholders — **deferred to ACTS-121 by design.** Seeded with the generic
      plural default response *"Have mercy on the souls of the faithful departed."* (correct
      standalone). ACTS-121 will tokenize it → *"the soul of {name}"* for a dedicated session.
- [x] How-To attached (`howto-rosary-for-the-dead`, `template_id` link + 5 bead-mapping steps + source link).
- [x] Source recorded (`src-olg-passion`); `STORAGE_KEY` v30→**v31**; browser-verified.

## Tests
_No runner (harness = ACTS-92). **Unit coverage exercised** via a Node harness
(`node --experimental-strip-types`) against the real `createSeedDatabase()` + compiler — 14/14:_
- **Unit** — template seeded (rosary, Sorrowful-pinned); prep + large-bead + source + how-to
  present; **5 mysteries in order** (Agony→Crucifixion); **50 sufferings (10×5)**; 5 large-bead
  prayers; 5 decade-closing Eternal Rests; response = generic plural; decade order
  (mystery < large-bead < sufferings); Sign of the Cross frames start + end. 68 items total.
- **Integration** — browser (localhost:8080, v31 reseed): renders in the builder + devotion detail
  with the full 5-decade structure; new prayers appear in the Prayers library; **no console errors**.
- **E2E** — pray the Rosary for the Dead to completion. N/A until harness lands (Pray-mode session
  structure is covered by the unit harness).

## Known follow-ups
- ACTS-121 retrofits `{name}`/pronoun tokens into `PASSION_RESPONSE` (and the OLG "her/him" form).
- Auto-How-To (ACTS-28) would generate a second `howto-tpl-rosary-for-the-dead` if the devotion is
  edited + saved in the builder — pre-existing behavior shared by all seeded how-tos, not new here.

## Notes
- Content source: OLG "Novena for One Who Has Died". Feeds **ACTS-107** as a rosary version.
- Name/pronoun substitution is **ACTS-121**; seed with placeholders so it degrades gracefully.
