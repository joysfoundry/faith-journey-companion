---
story: ACTS-186
session: 02
final: true
wrapped_at: 2026-09-15T13:31:56-0700
---

# ACTS-186 — session 02 (final)

## What happened
Closed out the connected-entity sweep. After the session-01 handoff, JC chose to finish 186
before moving on, so the one remaining item was wired:

- **Mass "Celebrant" → Vessel.** `WordSection.tsx` Celebrant field is now `EntitySuggestInput`
  over voices; accepting a suggestion links via a **new optional `MassExperience.celebrant_voice_id`**
  (additive, back-compat) so a priest's homilies thread to them. A new/unmatched name stays plain
  text (link-if-known, no forced Voice) — the same pattern as the mystery-attribution and provenance
  fields shipped in session-01.

This was the last stray entity input. Every stray box is wired and every could-be dispositioned;
deeper model work was spun out to its own stories rather than folded in.

## Verified (and how)
- `tsc --noEmit` clean.
- Live (dev server :8080, /word → "Mass (if applicable)"): typed "Fr. Mi" in Celebrant → suggested
  "Fr. Mike Schmitz" → accepted → Save Mass → localStorage `mass_experiences[0]` has
  `celebrant: "Fr. Mike Schmitz"` **and** `celebrant_voice_id: "voice-fr-mike"`. No duplicate Voice.

## Acceptance criteria — all met
- [x] Inventory of entity-name inputs (connected / stray / could-be) — in the pointer's Audit section.
- [x] Stray boxes wired to `EntitySuggestInput` (or a model gap filed): knowledge Vessel box,
      QuickAddLink From, mystery Attribution, Celebrant; could-bes wired (Tags, provenance Source);
      channel-name left as is; Church → model gap filed (ACTS-201).
- [x] No regressions to capture flows (verified live across the wired surfaces).
- [x] Sweep judged complete (JC, 2026-09-15).

## Git state at handoff
Code committed: `fd076e6` (celebrant wiring) + `d86810b` (sweep-complete doc). All session-01
work already on `origin/main`. **These final commits + this handoff are committed-not-pushed** —
the sandbox can't auth to GitHub; JC pushes from their client (`git push origin main`).

## Next (follow-on stories — new threads)
- **ACTS-204** (In Progress) — typed channels / content-under-channel model. Do next, in a new
  thread; model + matching only. Then **ACTS-187** unifies the add/edit form on top of it.
- **ACTS-201** parish entity · **ACTS-202** author vs publisher / channel↔Voice many-to-many ·
  **ACTS-203** real Tag entity.
