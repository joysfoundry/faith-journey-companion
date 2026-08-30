---
id: ACTS-121
title: Name + pronoun layer — dedicate a session "for whom"
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-119, ACTS-120]
started_at: null
updated:    2026-08-29T22:39:08-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying for a specific deceased person, I want to dedicate a session **to a named
soul** so the prayers address them by name and correct pronoun — and, left blank, fall back to
the plural "the faithful departed / them / they."

## Context
Surfaced across every departed source (Aurora = "Grandma Aurora / her"; OLG = "N." + "her/him /
s/he"; catholicdoors = generic "them"). A **cross-cutting compiler capability**, not litany-
specific. Seed text carries placeholders; the compiler substitutes at session generation from a
session-level "for whom" value.

## Design sketch (to refine)
- **Placeholders** in seed/template text — e.g. `{name}`, `{subj}` (she/he/they), `{obj}`
  (her/him/them), `{poss}` (her/his/their). A tokenizer resolves them in the compiler `push`
  path (title + body + versicle/response).
- **Session "for whom"** field: `{ name?: string; pronoun: "she" | "he" | "they" }` on
  `SessionContext` (and persisted on the plan). Blank name ⇒ `{name}` → "the faithful departed"
  and pronoun defaults to **they/them**.
- Back-compat: templates without placeholders are unaffected; substitution is a no-op.

## Acceptance criteria (draft)
- [ ] Placeholder tokens defined + documented; compiler substitutes them deterministically.
- [ ] Session builder captures an optional "for whom" (name + pronoun) for departed devotions.
- [ ] Blank name renders the plural faithful-departed fallback everywhere.
- [ ] Follow-along share carries the dedication so guests see the same names.
- [ ] Browser-verified with a named vs blank session.

## Tests
_Planned — no runner (harness = ACTS-92); document per ACTS-91._
- **Unit** (Vitest): substitution resolves each token; blank-name plural fallback; no-op when
  no placeholders.
- **Integration**: builder sets "for whom"; compiled session shows the name; blank shows plural.
- **E2E**: dedicate + pray a named session; share renders the name. N/A until harness lands.

## Notes
- Consumed by **ACTS-119/120** seeds and assembled in **ACTS-107**. Keep the token set small.
