---
id: ACTS-168
title: The mark as the O — a wordmark lockup, built and wired but switched off
spine: ACTS-144
status: In Progress
origin: human-typed
depends_on: []
relates_to: [ACTS-148, ACTS-167, ACTS-144]
started_at: 2026-09-06T02:10:00-0700
updated:    2026-09-06T02:10:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As Oravia, I want the mark set *inside* the word as its O, so the name carries its
own symbol rather than travelling beside one — available to switch on when JC decides,
without shipping it to testers first.

The mark was drawn as "the O of Oravia" in ACTS-148. This puts it back in the word.

## What landed
- **`src/components/layout/OraviaWordmark.tsx`** — the lockup, plus the single flag
  `WORDMARK_LOCKUP_ENABLED`, shipping **`false`**.
- **`OraviaMark.tsx`** — cross paths extracted to `REGULAR_CROSS` / `SMALL_CROSS` so the
  wordmark draws the same shape instead of keeping a copy that can drift.
- **Both call sites wired**, branching on that one flag:
  - `Brand.tsx` → mobile header, desktop side rail, mobile drawer (three renders).
  - `gate-shell.tsx` → the beta gate, the name prompt, and both onboarding questions.
- **`docs/brand/design-system/brand/wordmark.html`** — the specimen card: fit ladder,
  cross vs ring-only, colourways, tagline lockup, small-size ladder, a side-by-side with
  today's header, and do/don't rules. Marked **Proposed — not adopted**, following the
  same convention `palette-states.html` uses for the staged palette.
- Synced to the **Oravia Design System** project on claude.ai/design (23 cards).

## Why gate-shell moved with Brand
`gate-shell.tsx` is the **largest** the name appears anywhere and the first thing a new
person sees — and it has **never carried the mark at all**. Switching only the header
would leave the biggest wordmark plain while the small one gained a symbol. Turning the
flag on *adds* the mark to the arrival screen; it does not merely rearrange it.

## Two measured constants (do not guess these)
- **`O_INK = 0.648`** — a Cormorant Garamond capital O inks 0.648 of its font-size,
  rasterised and bounding-boxed at 128px and 256px, identical at weights 400/500/600.
  Below ~40px the measurement is rasterisation noise, which is why it is a constant and
  not a runtime probe.
- **`OUTER = 72`** — SVG centres a stroke on its path, so the mark's visible outer
  diameter is `2 × (r + stroke/2)` = 72 of its 100-unit canvas, **not** `2r` = 66.
  Sizing off 2r is the off-by-a-stroke behind ACTS-167; here it renders the ring ~9% small.

## Acceptance criteria
- [x] Flag `false` → app renders byte-for-byte as before (verified: plain `Oravia` h1, no
      SVG in it; header unchanged).
- [x] Flag `true` → both surfaces switch; ring geometry exact (22.0px measured vs 22.0
      expected at 36px), mark resolves to `--gold`, word to `--foreground`.
- [x] Accessible name still computes as "Oravia" on the gate `h1` (role=img + aria-label),
      not "ravia".
- [x] Design-system card reads Proposed, and is indexed (the `@dsCard` marker needed
      `group`/`name`/`subtitle`; it was first written with `section`/`title`/`order` and
      would have been silently skipped).
- [x] Synced to claude.ai/design.
- [x] **JC decided: on.** Flag flipped in `266a008` after reviewing all four surfaces.
- [ ] JC sees it in the real app after publish, and confirms the header still carries enough
      presence at 62% of the old mark size (see below).

## Tests
_Per ACTS-91; no runner yet (ACTS-92), so these are **planned**._
- **Unit** (Vitest — pure `src/lib/**`): **N/A** — nothing in `src/lib` changed. The
  geometry is a handful of constants inside the component.
- **Integration** (Testing Library): **planned, and the one that matters** — render
  `Brand` and `GateShell` with the flag both ways; assert the accessible name is "Oravia"
  in all four cases, and that the mark SVG is absent when the flag is off. That last
  assertion is what stops the lockup shipping by accident.
- **E2E** (Playwright): **N/A** — no user flow changes while the flag is off.
- **Verified instead**: flag flipped both ways against the running dev server, geometry
  and computed colours read out of the live DOM, `tsc --noEmit` clean both ways.

## The one real tradeoff
**Turning this on shrinks the mark in the header.** `Brand.tsx` set a 30px `OraviaMark`
beside 20px text — a ring **21.6px** across, 1.5× the type, free to be as large as it liked.
Bound to the type as its O it is **13.3px** at the same font-size: **62%** of what it was.
Inherent to the idea, not a defect. If the header needs its presence back, raise the
wordmark's `fontSize` there — do not change `FIT`, which is what keeps the ring reading as a
letter rather than an ornament parked beside one. The arrival screen has the opposite story:
it gains a mark it never had, at 36px.

## Notes
- If the answer is "no", the removal is `OraviaWordmark.tsx` plus two branches — the
  `REGULAR_CROSS`/`SMALL_CROSS` extraction is worth keeping either way.
