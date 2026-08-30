---
story: ACTS-121
session: 01
wrapped_at: 2026-08-30T08:53:41-0700
status: In Progress
final: false
---

## What happened
Built the **name + pronoun (dedication) layer** — pray a devotion "for" a specific soul.

- **types.ts**: `Pronoun` ("she"|"he"|"they") + `Dedication` ({ name?, pronoun }); optional
  `SessionContext.for_whom` (persists via `SessionPlan.context`).
- **compiler.ts**: `substituteDedication(text, forWhom?)` — tokens `{name}` `{subj}` `{obj}`
  `{poss}` `{us}` (case-insensitive; capitalized token → capitalized value). `{us}` is the
  general→departed case: object pronoun when dedicated, else "us". Applied in `push` to every
  compiled item's title + body. No dedication ⇒ plural fallback ("the faithful departed",
  they/them/their, "us").
- **Seed retrofit**: `eternal-rest` ({obj}/{subj}, blank == old behavior), Decade of the Passion
  response ("soul of {name}"), Faithful Departed refrains ({obj}/{poss}), Loreto "us" → {us}.
- **Display strip-to-generic** at READ sites so raw `{tokens}` never show: prayer detail
  ([prayer.$prayerId](../../src/routes/prayer.$prayerId.tsx)), devotion detail
  ([devotion.$devotionId](../../src/routes/devotion.$devotionId.tsx)), builder preview
  ([DevotionItemsEditor](../../src/components/prayer/DevotionItemsEditor.tsx)). Edit fields keep
  raw tokens (editing the source).
- **Builder UI** ([pray.tsx](../../src/routes/pray.tsx)): optional "Prayed for" field (name +
  they/she/he), wired into `buildContext()`, reset in resetForm/loadPlan. Only sets `for_whom`
  when a name or non-"they" pronoun is chosen — otherwise the session prays generically.
- **Share**: no change needed — the codec encodes the already-substituted compiled items.
- **STORAGE_KEY** v32 → **v33**.

Confirmed with JC mid-session: the dedication is an **optional, session-level, purpose-tied**
choice — not a template property, and often unused.

## Verified (and how)
- `tsc --noEmit` clean.
- **Engine harness** (`node --experimental-strip-types`, scratchpad `seed-121-test.ts`) — **21/21**:
  every token; named vs blank; `{us}` dual behavior; capitalized token; token-free no-op; compiled
  Decade dedicated → "the soul of Grandma Aurora" + "grant unto her… may she rest"; generic →
  "the faithful departed" + "them/they" (back-compat); Loreto "pray for her" vs "pray for us"; FD
  "deliver her" vs "deliver them"; unrelated Hail Mary untouched.
- **Browser** (v33): prayer detail renders generic "them" (no raw tokens); FD litany detail
  expanded = **0 token leaks**; Fidelium collect correctly not in the litany body; builder
  "Prayed for" field (name input + pronoun select) present.
- A **pre-existing** SSR hydration warning appears on prayer-detail full loads — reproduced on the
  token-free `our-father` page too, so unrelated to this change.

## Git state at handoff
Uncommitted — not `/save`d. Changed: `src/lib/prayer/types.ts`, `compiler.ts`, `store.ts`,
`src/routes/pray.tsx`, `prayer.$prayerId.tsx`, `devotion.$devotionId.tsx`,
`src/components/prayer/DevotionItemsEditor.tsx`; docs: `stories/ACTS-121.md`, this handoff.

## Next
- `/save` ACTS-121, then **ACTS-107**: assemble the composite via ACTS-110 blocks —
  Decade-of-the-Passion block → Litany block (Faithful Departed or Loreto) → closing collects
  (`collect-fidelium`, `collect-departed-kindred`) → Eternal Rest → Sign of the Cross; dedicate it
  to a soul; browser-verify prayable + shareable follow-along.
- Optional polish (not blocking): tokenize the remaining collective "the faithful departed" lines
  in the FD litany if JC wants the name to appear there too.
