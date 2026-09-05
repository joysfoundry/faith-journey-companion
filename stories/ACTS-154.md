---
id: ACTS-154
title: Move the "Online Bible" link onto the Word card header (it reads as a sub-item of Daily Readings)
spine:
status: To Do
origin: human-typed
depends_on: []
relates_to: [ACTS-153, ACTS-152, ACTS-145]
started_at: 2026-09-04T20:36:01-0700
updated:    2026-09-04T20:36:01-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone glancing at Home, I want **Online Bible** to read as a permanent link to *my*
Bible — not as a second way into today's readings — so the Word card stops looking like it
offers the same thing twice.

## The problem (JC, 2026-09-04)
In [`WordSection.tsx`](../src/components/home/WordSection.tsx) the Online Bible link is
rendered **inside the Daily Readings block**, directly beneath the liturgical-day link and
in a smaller, muted style. Its size and position make it look like a **child of Daily
Readings** when it is nothing of the kind: Daily Readings opens today's USCCB readings,
while Online Bible opens the reader's own Bible app (`resolveBibleHomeUrl`, set in Settings
and now also asked at first launch — **ACTS-153**). Two Scripture links stacked together,
one visually subordinate to the other, reads as redundancy.

## Decided before filing
- **Keep the section named "Word."** JC considered renaming it BIBLE; rejected, because
  the card also holds the **Mass capture** (church, celebrant, homily transcript) and
  **reading programs** — naming the container after one of its contents would make the
  rest look misfiled. Same reasoning that kept `Amphora` for Vessels in **ACTS-152**.
  "Word" also carries the Liturgy-of-the-Word sense.
- **Keep the label "Online Bible."** JC likes it; the fix is placement and weight, not
  wording.
- **Put it on the card header**, beside the existing "open the full Word page" action.
  `SectionCard` already exposes an `actions` slot for exactly this kind of section-level
  utility.

## Acceptance criteria
- [ ] "Online Bible" no longer renders inside the Daily Readings block.
- [ ] It appears on the **Word card header** via `SectionCard`'s `actions` slot, at a
      weight that reads as a section-level link rather than a sub-item.
- [ ] ⚠️ **Not a second book icon.** The header already carries `BookOpen` for "open the
      full Word page"; two identical glyphs meaning different things is the ACTS-152
      trap. Use the text label (optionally with the small external-link chevron), or a
      distinct icon.
- [ ] It still resolves through `resolveBibleHomeUrl(db.settings)` and is **omitted
      entirely** when that returns "" (e.g. "I don't use one yet", or "another app" with
      no URL) — today's conditional render must survive the move.
- [ ] Both surfaces are correct: `WordSection` is shared, so Home **and** `/word` change
      together — check the header treatment works on the `/word` page, which has its own
      `AppShell` heading rather than a `SectionCard`.
- [ ] Mobile: the header row (title + up to two actions) doesn't wrap or crowd.
- [ ] `tsc --noEmit` clean; browser-verified on Home and `/word`.

## Notes
No model or storage change — presentation only, so **no `STORAGE_KEY` bump**.

## Tests
- **Unit** (Vitest): N/A — presentational move, no logic. `resolveBibleHomeUrl` is already
  covered by its own behavior and unchanged here.
- **Integration** (Testing Library): the link renders in the header when a Bible home URL
  resolves, and is absent when it resolves to "".
- **E2E** (Playwright): feeds **E13** (Bible deep-link out) — from Home, the header link
  opens the reader's chosen Bible. No runner yet (ACTS-92), so planned.
