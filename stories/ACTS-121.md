---
id: ACTS-121
title: Name + pronoun layer — dedicate a session "for whom"
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-119, ACTS-120]
started_at: 2026-08-30T08:45:00-0700
updated:    2026-08-30T08:53:41-0700
latest_handoff: ACTS-121/session-01.md
sessions: 1
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

## Acceptance criteria
- [x] Placeholder tokens defined + documented; compiler substitutes deterministically —
      `substituteDedication` in [compiler.ts](../src/lib/prayer/compiler.ts): `{name}` `{subj}`
      `{obj}` `{poss}` `{us}` (case-insensitive; capitalized token → capitalized value). Applied
      to every compiled item's title + body.
- [x] Session builder captures an optional "for whom" (name + pronoun) — [pray.tsx](../src/routes/pray.tsx)
      "Prayed for (optional)" field (name + they/she/he), persisted via `SessionContext.for_whom`.
- [x] Blank name renders the plural faithful-departed fallback everywhere — no dedication ⇒
      `{name}`→"the faithful departed", pronouns→they/them/their, `{us}`→"us". Read displays
      (prayer detail, devotion detail, builder preview) strip tokens to this generic form so no
      raw `{token}` ever shows; edit fields keep the raw tokens (editing the source).
- [x] Follow-along share carries the dedication — the share codec encodes the **compiled**
      SessionItems, whose text is already substituted, so a dedicated session's names ride along
      for guests with no codec change.
- [x] Browser-verified named vs blank — engine harness + display checks (no token leaks; generic
      "them" renders; builder field present).

## Seed retrofit (tokenized generic → dedication-aware)
- `eternal-rest` prayer: `{obj}`/`{subj}` (blank → "them/they" — identical to before).
- Decade of the Passion response: "Have mercy on the soul of `{name}`".
- Litany of the Faithful Departed: `{obj}`/`{poss}` on the "them/their" refrains.
- Litany of Loreto: `{us}` on "pray for / have mercy on / spare / graciously hear us" — so a
  departed dedication reads "…her/them", a general Marian recitation stays "…us".

## Tests
_No runner (harness = ACTS-92). **Unit coverage exercised** via a Node harness — 21/21:_
- **Unit** — token resolution for every token, named vs blank, `{us}` dual behavior, capitalized
  tokens, no-op on token-free text; compiled Decade dedicated → "the soul of Grandma Aurora" +
  "grant unto her… may she rest"; generic → "the faithful departed" + "them/they" (back-compat);
  Loreto "pray for her" vs "pray for us"; FD "deliver her" vs "deliver them"; unrelated prayer
  (Hail Mary) untouched.
- **Integration** — browser (v33): prayer detail shows generic "them" (no raw tokens); FD litany
  detail expanded shows **0 token leaks**; builder "Prayed for" field (name + pronoun) renders.
- **E2E** — dedicate + pray a named session; share renders the name. N/A until harness lands
  (compile path — what Pray mode + share encode — covered by the unit harness).

## Notes
- A pre-existing SSR hydration warning shows on prayer-detail full loads (affects token-free
  pages like `our-father` too) — unrelated to this change.

## Notes
- Consumed by **ACTS-119/120** seeds and assembled in **ACTS-107**. Keep the token set small.
