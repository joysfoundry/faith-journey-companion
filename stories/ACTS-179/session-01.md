---
story: ACTS-179
session: 01
wrapped_at: 2026-09-09T17:05:00-0700
status: Done
final: true
---

## What happened
Added a **By Channel** grouped view to the Vessels library — the parallel to the
existing **By Vessel** view, but bucketed by **platform** instead of by who.

- **New chip + grouped view** ([formation.tsx](../../src/routes/formation.tsx)):
  content groups into **platform sections** (Instagram, YouTube, Podcast, Website, …),
  **alphabetical by platform label** so all Instagrams cluster, all YouTubes cluster.
  Each section header shows the platform icon (`PLATFORM_ICON` from ACTS-178) + name +
  a piece-count, with the same collapse/expand controls as By Vessel. Items show their
  **Voice** (grouping is by platform, not who).
- **Platform resolution** (`itemPlatform`): an item's platform = its `channel_id`
  channel's platform → else its pinned/first link's platform → else none. Items with
  none (quotes, linkless items) fall to a trailing **No channel** bucket.
- **Chip row reordered**: `By Vessel · By Channel · Programs · Books · Media · Quotes ·
  All` — By Vessel front, All last (JC: "put all last and put vessel in front").
- **Single-select** chips kept (JC picked model 1 over stacked axes); search composes
  within the grouped view.

**Design reconciliation:** JC's answers narrowed the original "Voice + Channel filters"
story — **Voice** is already served by the existing **By Vessel** chip, so the real work
was the parallel **By Channel** view. No voice-kind filter added.

**Left intentionally:** an item lands in **one** section (its primary platform), not
every platform it links to — mirrors By Vessel (one item, one group). No data-shape
change, no `STORAGE_KEY` bump.

## Verified (and how)
Browser (localhost:8080): the reordered chip row renders (By Vessel · By Channel ·
Programs · Books · Media · Quotes · All); **By Channel** groups content into alpha-order
platform sections (Podcast · Store · YouTube · No channel), each item showing its Voice
(Fr. Mike Schmitz, Trent Horn, @anamunley); platform icons + counts in headers. Search
composes: "padre" → narrowed the YouTube section to the one video **and** dropped the
Padre Pio quote into No channel. `tsc --noEmit` clean, no console errors, By Vessel
view untouched.

## Git state at handoff
Committed + pushed to `origin/main` (JC pushed from their git client after the env's
push auth failed). Code `24dc963`, docs `0f46738`. Tree otherwise carries unrelated
pre-existing changes (invite.html, about.tsx, ACTS-162.md, feedback migration) — left
untouched.

## Acceptance criteria — all met
- [x] By Channel chip alongside existing chips; Voice served by By Vessel.
- [x] Platform sections, alphabetical by label.
- [x] Platform resolves from channel_id → pinned/first link → No-channel bucket.
- [x] Composes with search; clear empty state.
- [x] Chip row reordered (Vessel front, All last).
- [x] Read-side only; no STORAGE_KEY bump.

## Next
Done. Relates [[pins-channels-vessels-model]] (ACTS-177/178). Sibling follow-on
**ACTS-180** (paper vs audio book link formats) still open.
