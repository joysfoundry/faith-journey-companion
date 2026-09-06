---
story: ACTS-168
session: 01
wrapped_at: 2026-09-06T01:51:19-0700
status: Done
final: true
---

## What happened
JC asked for the mark set **inside** the word as its O — it was drawn as "the O of Oravia"
in ACTS-148 — then set the terms: do both call sites, keep the design-system card
**proposed**, sync it, but **do not render it in the app yet**.

Built `src/components/layout/OraviaWordmark.tsx` with one flag,
`WORDMARK_LOCKUP_ENABLED`. `Brand.tsx` (mobile header, desktop side rail, mobile drawer)
and `gate-shell.tsx` (beta gate, name prompt, both onboarding questions) each branch on it,
so one line switches every surface. Cross paths moved to `REGULAR_CROSS`/`SMALL_CROSS` on
`OraviaMark` so the wordmark cannot drift from the mark.

**Then JC changed his mind twice, which is the story.** He asked to see it live, so the flag
went **on** (`266a008`) and shipped. He asked for the header bigger, so `LOCKUP_SIZE` went
20 → **24px** (`21d41c6`). He looked at it in the real app and turned it **back off**
(`3478d35`). Everything stays in place; `true` restores it in one edit, and the card's
"Proposed, not adopted" label is accurate again.

## The finding that decided it
**As the O, the mark can only be letter-sized.** Standing beside the word it was a 30px
`OraviaMark` next to 20px text — a ring **21.6px** across, 1.5× the type, free to be any
size. Bound to the type as its letter it is **13.3px** at 20px, and **16.0px (74%)** even
after the header was raised to 24px. Breaking even needs **32px** type — a different header,
not a bump — or 28px+, where the mark swaps to the **regular cut** and becomes a different
shape. The arrival screen runs the other way: it *gains* a mark it never had, at 36px.

**If revisited: raise `fontSize`, never `FIT`.** That ratio is what keeps the ring reading
as a letter rather than an ornament parked next to one.

## Two constants, measured not guessed
- **`O_INK = 0.648`** — a Cormorant Garamond capital O inks 0.648 of its font-size,
  rasterised and bounding-boxed at 128 and 256px, identical at weights 400/500/600. **Below
  ~40px the measurement is rasterisation noise**, which is why it is a baked constant and
  not a runtime canvas probe.
- **`OUTER = 72`** — SVG centres a stroke on its path, so the visible outer diameter is
  `2 × (r + stroke/2)` = 72 of the 100-unit canvas, **not** `2r` = 66. Same
  off-by-a-stroke as ACTS-167; here it renders the ring ~9% small.

## Verified (and how)
Flag flipped **both ways** against the running dev server, not reasoned about:
- **Off** — plain `Oravia` `h1`, zero SVG inside it, header identical to before.
- **On** — all four surfaces switch; ring **22.0px measured against 22.0 expected** at 36px;
  mark resolves `--gold`, word `--foreground`; the gate `h1` still computes an accessible
  name of **"Oravia"** (role=img + aria-label), not "ravia".
- **At 24px, 375px viewport** — lockup right edge 204 of 375, no horizontal overflow, no
  collision with the date.
- `tsc --noEmit` clean in every state.

## Things that would have bitten
- **`Brand.tsx` covers only three of four wordmark surfaces.** `gate-shell.tsx` is the
  fourth — and it is the *largest* the name appears anywhere, the first thing a new person
  sees, and it had **never carried the mark at all**. Wiring only `Brand.tsx` would have
  given the small header a symbol while the opening screen stayed plain.
- **The `@dsCard` marker fails silently.** It must be `group=`/`name=`/`subtitle=`; written
  `section=`/`title=`/`order=` the card is simply never indexed, with no error. Check a
  working sibling before trusting a new one.
- **A placeholder commit hash reached the board** (`4e...`, written before the commit
  existed). Caught and corrected in `69fb131` — a follow-up, not an amend.

## Git state at handoff
Pushed by JC: `789f055`, `b15548a`, `345d42c`, `266a008`, `245a3b3`, `21d41c6`,
`053a845`, `69fb131`. **`3478d35` (the flag back off) is committed and NOT pushed** —
`git push` fails from this environment.

Synced to **claude.ai/design** (Oravia Design System, 23 cards) along with ACTS-167's
corrected `mark.html` and regenerated icons, which had been stuck at the 2026-09-04 version.

## Next
Nothing required — the story delivered a lockup *and* a decision, and the decision was no.

Two things left deliberately, both cheap to reverse:
- The card still reads **Proposed, not adopted**, which is correct now that the flag is off.
  Had the answer been yes it would have needed flipping and re-syncing.
- If it is ever revisited, the integration test worth writing first is the one asserting the
  mark SVG is **absent** while the flag is off — that is what stops this shipping by
  accident. Blocked on the ACTS-92 harness.
