---
session_date: 2026-08-29
wrapped_at: 2026-08-29T19:22:14-0700
stories_touched: [ACTS-106, ACTS-107]
kind: forked chat (new seeding) — branched from the ACTS-104 PRD/vision discussion
---

# Session — seed fork: ACTS-106 (Eternal Rest + "Why We're Catholic") + spinoff ACTS-107

## What happened (in order)
1. **Vision-doc work (non-repo).** Updated `~/Downloads/ACTS.md` (the personal copy of the
   product vision) to v2 framing: added the missing **Problem / Solution / Position / origin
   story**, a **"What's shipped today"** inventory (Shipped/Partial/Future), taxonomy update
   (Song/Litany/Lectio), shipped-notes in §22/§26/§27/§28, and a new **§35 Share &
   Follow-Along** section. Naming decided: **Faith Journey = umbrella vision, ACTS = the
   prayer-first product shipping now.** (The in-repo canonical PRD is `docs/ACTS-PRD.md` v2
   from ACTS-104; this was the Downloads copy.)
2. **Requested a repeatable process** for reconciling a PRD with shipped code at a resting
   point → this is the existing global **`/prd-sync`** skill (canonical doc = `docs/ACTS-PRD.md`).
   The `.docx` export + "copy in Google" step was **paused and moved to the other chat** by JC.
3. **`/spinoff`** (this is the fork): filed two parked, ready-to-`/start` stories —
   **ACTS-106** (seed) and **ACTS-107** (Litany of the Departed, stub). Counter → 107.
   Original story pointer untouched.
4. **`/start ACTS-106` → implemented → `/save` → `/done`.** See Verified below.

## Verified (and how)
- **ACTS-106** — `npx tsc --noEmit` clean. Browser (localhost:8080): Home **Vessels** shows
  the **"Why We're Catholic"** pin (→ Amazon); `/prayers` lists **Eternal Rest Prayer**;
  `/prayer/eternal-rest` renders body + taxonomy (Devotional · Vocal) + tags + **Source** link
  to mycatholicprayers.com. No console errors. All 5 ACs met. **Done.**

## Git state at handoff
- **Committed to `main`, NOT pushed** (GitHub auth unavailable in this environment —
  `could not read Username`). 4 unpushed commits:
  - `0cd3a4d` docs: spinoff ACTS-106 + ACTS-107 (pointers, board, counter)
  - `30aeddf` ACTS-106 code (Eternal Rest Prayer, book retitle + Home pin, STORAGE_KEY v30)
  - `c000d8b` ACTS-106 ACs checked
  - `01c3765` ACTS-106 done (final handoff)
- **Action for JC:** `git push origin main` from an authed git client.

## Parked / next
- **ACTS-107** — Litany of the Departed devotion (Rosary + Litany: offering/invitation →
  litany sequence → closing/requiem → Eternal Rest Prayer → Sign of the Cross). Parked,
  `depends_on: ACTS-106` (now Done), relates ACTS-57. Structure + exact wording = next chat.
- **Other chat:** finish the vision-doc `.docx` export + Google copy (`/prd-sync` tail).
- Optional ACTS-106 tweaks JC may want: reclassify the prayer Liturgical vs Devotional;
  set the book `in_progress` if it should read as currently-reading.

## Next session — opener (paste to start)
> Push is pending — run `git push origin main` first (4 commits from 2026-08-29).
> Then `/start ACTS-107` to build the **Litany of the Departed** devotion: a composite
> Rosary + Litany in order — offering/invitation, litany sequence (reuse the ACTS-57 litany
> model: call=label, refrain=body), closing/requiem prayers, the **Eternal Rest Prayer**
> (`eternal-rest`, seeded in ACTS-106), and the Sign of the Cross. I'll provide the exact
> wording; confirm how the builder/compiler represents a composite devotion, then seed it
> and bump STORAGE_KEY.
