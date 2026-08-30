---
story: ACTS-119
session: 01
wrapped_at: 2026-08-30T07:41:44-0700
status: In Progress
final: false
---

## What happened
Seeded the **Decade of the Passion / Rosary for the Dead** — a Passion-focused rosary version
that replaces the standard rosary, prayed for the departed (Filipino Pasiyam custom, OLG source).

- **prayers** ([seed.ts](../../src/lib/prayer/seed.ts)): `passion-preparation` ("Lord, open our
  lips…") and `merciful-jesus-look-down` (the large-bead prayer), both `src-olg-passion`.
- **template** `tpl-rosary-for-the-dead` — `kind: rosary`, `mystery_count: 5`, `title_only`,
  `fixed_mystery_set_id: set-sorrowful`, notes + source.
- **items** `rosaryForDeadItems()` — Sign of the Cross → preparation → for each of 5 decades:
  announce Sorrowful mystery → "Most Merciful Jesus" (Our Father bead) → **10 Passion sufferings**
  as call/response salutations (`PASSION_SUFFERINGS`, repeated every decade per JC) → Eternal Rest
  (`eternal-rest`, ACTS-106) → Sign of the Cross. Wired via `...rosaryForDeadItemsList`.
- **source** `src-olg-passion`; **how-to** `howto-rosary-for-the-dead` (5 bead-mapping steps + link).
- **STORAGE_KEY** v30 → **v31** ([store.ts](../../src/lib/prayer/store.ts)).

**Design decision (flagged):** the suffering response is seeded as the **generic plural default**
— *"Have mercy on the souls of the faithful departed."* — not a placeholder token. **ACTS-121**
will tokenize it (`{name}` / pronouns) so a dedicated session reads *"the soul of {name}"*. This
keeps ACTS-119 correct and prayable standalone with no literal `{tokens}` showing.

## Verified (and how)
- `tsc --noEmit` clean.
- **Compile harness** (`node --experimental-strip-types`, scratchpad `seed-119-test.ts`) against
  the real `createSeedDatabase()` + compiler — **14/14 PASS**: seeded (rosary, Sorrowful-pinned,
  prep/large-bead/source/how-to present); **5 mysteries in order** (Agony · Scourging · Crowning ·
  Carrying · Crucifixion); **50 sufferings (10×5)**; 5 large-bead prayers; 5 Eternal Rests; response
  = generic plural; decade order correct; Sign-of-the-Cross frames. 68 items total.
- **Browser** (localhost:8080, v31 reseed): `/devotion/tpl-rosary-for-the-dead` +
  `/template/tpl-rosary-for-the-dead` render the full 5-decade structure; new prayers listed in the
  Prayers library; **no console errors**. (Radix tab-switch to Devotions/How-To can't be driven
  programmatically in this pane — the listings filter the same verified seed data.)

## Git state at handoff
Uncommitted — not `/save`d. Changed: `src/lib/prayer/seed.ts`, `src/lib/prayer/store.ts`;
docs: `stories/ACTS-119.md`, this handoff.

## Next
- `/save` ACTS-119, then **ACTS-120** (Litany of the Faithful Departed + Loreto/BVM + closing
  collects), then **ACTS-121** (name/pronoun), then **ACTS-107** (assemble the composite via
  ACTS-110 blocks: Rosary-for-the-Dead block + Litany block + closings, name-dedicated, shareable).
- When ACTS-107 composes this as a block, its Sign-of-the-Cross framing may double with an Opening
  block — ACTS-107 to de-dupe (drop this block's frames or the opening's).
