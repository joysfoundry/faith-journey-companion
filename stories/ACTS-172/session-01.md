---
story: ACTS-172
session: 01
wrapped_at: 2026-09-08T03:25:38-0700
status: Done
final: true
---

## What happened
Unblocked the story by reading JC's data straight from the **Claude preview's** localStorage
(the browser JC works in) instead of a hand-pasted export. Found the "mystery" is a custom
**mystery body** over the Glorious set, not a mystery set. Seeded into `seed.ts`:
- Devotion `tpl-mater-dei-weekly-rosary` + 35 items (`materDeiRosaryItems()`).
- Mater Dei mystery body for **all 20** mysteries — Glorious = JC's NABRE
  (`src-mater-dei-catholic-church`), the other 15 = USCCB placeholders (`src-usccb-rosary`),
  per JC ("use USCCB for non-Glorious days, fill them in for me until I update them").
- Source `src-mater-dei-catholic-church`; `STORAGE_KEY` v40 → v41 (`store.ts`).
- `favorite` omitted (JC: keep unstarred).

Also fixed the blank devotion-block step JC reported ("see 32"): the real culprit was the
**devotion detail page** (`devotion.$devotionId.tsx:292`, `item.label ?? item.kind` — empty
string survives `??`), not only the compiler. Added a `template_block` case there resolving
the referenced devotion's name. (The compiler-side fix `405f670` covers the session guide.)

## Verified (and how)
In the port-8080 preview, cleared the stale v41 key and let it re-seed from the new code:
- v41 seeded with the devotion (35 steps), 20 Mater Dei body rows (5 parish NABRE + 15 USCCB),
  the source — all present; joyful-1 → USCCB Luke 1:26-27, glorious-2 → parish Acts 1:9–11.
- Devotion detail page step 32 renders "Litany of the Blessed Virgin Mary (Loreto)" (screenshot).
- `tsc --noEmit` clean.

## Git state at handoff
Committed & pushed to `main`: `seed.ts`, `store.ts`, `devotion.$devotionId.tsx`, story +
handoff, backlog row. (`compiler.ts` block-title fix was already committed as `405f670`.)
Unrelated pre-existing working-tree changes left untouched (invite.html, about.tsx,
ACTS-162.md, 0003_feedback.sql).

## Next
JC: publish from `main` (manual — commits don't auto-deploy). Later, fill the four Glorious
prose reflections and swap the 15 USCCB placeholders for the parish's own Scripture in
`seed.ts` (`materDeiGloriousBodies` + the loop).
