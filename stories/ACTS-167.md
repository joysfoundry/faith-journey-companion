---
id: ACTS-167
title: Make the app-icon mark fill its tile — it shipped at 40% and reads as a dot
spine: ACTS-144
status: Done
origin: human-typed
depends_on: []
relates_to: [ACTS-148, ACTS-144, ACTS-96]
started_at: 2026-09-06T01:12:53-0700
updated:    2026-09-06T01:51:38-0700
latest_handoff: ACTS-167/session-01.md
sessions: 1
visibility: live
---

## Goal
As someone who has added Oravia to their iPhone home screen, I want the mark to fill its
icon the way every other app's does, so that Oravia doesn't read as a small dot in a navy
square next to the apps beside it.

JC screenshotted his home screen: Oravia's mark sits noticeably smaller than the marks in
the neighbouring icons, relative to the same tile.

## Root cause — two things compounding
1. **The mark's own canvas has air baked in.** `public/oravia-mark.svg` is a 100-unit
   viewBox with the ring at `r33`, so the visible mark is only **66 of 100 units**. The
   ACTS-148 icons scaled that *whole canvas* to the tile, which lands the mark at
   **40% of the tile width** (measured: 72px of 180, 202 of 512). The maskable was worse
   at **30.5%**. Nothing looked wrong in isolation — only next to other icons.
2. **`apple-touch-icon.png` had transparent corners.** iOS applies its own squircle and
   composites any transparency onto black, so the navy tile itself was inset too, making
   the whole icon read smaller than its neighbours.

Secondary: `favicon.ico` carried only a 16px frame, though the design system documents it
as 16/24/32/48/64.

## Fix direction
Size the tile from the **ring**, not the canvas: `canvas = tile × ring_frac × 100 / (2r)`.

- `ring_frac` **0.66** for the plain icons — which is exactly the brand's own clear-space
  rule (a quarter of the diameter on every side ⇒ tile = 1.5 × diameter), so the mark gets
  as large as the guideline allows and no larger.
- `ring_frac` **0.62** for the maskable, inside Android's guaranteed 80%-diameter safe
  circle. The mark is effectively circular, so nothing can be cropped.
- `apple-touch-icon` and the maskable go **full-bleed**; the `purpose: "any"` PNGs keep
  their 20% rounded corners.
- Below 20px the `.ico` frames use the small cut (heavier ring, shorter arms), per the
  existing two-cuts rule.

New `docs/brand/make_icons.py` is the generator — the ACTS-148 one was never committed, so
the icons had no reproducible source. It writes both `public/` and
`docs/brand/design-system/brand/assets/`, and resolves paths from `__file__` (its siblings
`make_og.py` / `make_about.py` / `make_flyer.py` all assume `cwd = docs/brand`).

⚠️ **Icons do not ship by replacing files.** `public/sw.js` serves images
stale-while-revalidate and precaches `/icon-192.png`, so `VERSION` must go `fj-v2` → `fj-v3`
and the `?v=` query must be bumped on every reference (`__root.tsx`,
`manifest.webmanifest`, `invite.html`, the sw shell list). Same trap as ACTS-148.

## Acceptance criteria
- [x] Visible ring is ≥ 0.65 of the tile on `apple-touch-icon`, `icon-192`, `icon-512`,
      and ≥ 0.60 on `icon-maskable-512`, measured from the rendered pixels.
- [x] The mark is centred to the pixel in every icon.
- [x] `apple-touch-icon.png` is fully opaque (no transparent corners).
- [x] `favicon.ico` carries 16/24/32/48/64, small cut below 20px, legible at 16.
- [x] Icons are regenerable: `python3 docs/brand/make_icons.py` from anywhere.
- [x] `sw.js` `VERSION` = `fj-v3` and every `?v=` bumped to `v=3`.
- [x] The design-system `brand/mark.html` app-icon row matches what ships.
- [x] **Deployed assets verified byte-identical** to the repo after JC published; live
      `sw.js` reads `fj-v3`. JC closed the story without reporting back on the home-screen
      re-add, which iOS requires and only he can do — recorded in the final handoff.

## Tests
_Per the ACTS-91 convention; no runner yet (harness = ACTS-92), so these are **planned**._
- **Unit** (Vitest — pure `src/lib/**`): **N/A** — no `src/lib` code changed. The only
  `src/` change is a cache-busting query string in `__root.tsx`. The generator is a
  build-time Python script outside the app bundle.
- **Integration** (Testing Library): **N/A** — no component behaviour changed.
- **E2E** (Playwright): **N/A** — icon assets aren't reachable from a user flow. The
  meaningful check is the manifest/`sw.js` version bump actually invalidating the cache,
  which needs a real install (JC's device) rather than a headless run.
- **Verified instead, by pixel measurement** on the generated PNGs (ring width / tile
  width, centring, corner alpha, `.ico` frame list) plus an iOS-squircle before/after
  render at home-screen size. `tsc --noEmit` clean. `make_about.py` / `make_flyer.py`
  re-run clean against the refactored `mark.py`.

## Notes
- `make_og.py` fails from the repo root (hardcoded `../../public/og-cover.png`) — a
  **pre-existing** `cwd` bug, not caused by this story. `og-cover.png` left untouched.
- This fork branched off a chat holding **ACTS-162**; `stories/ACTS-162.md`,
  `src/routes/about.tsx` and `supabase/migrations/0003_feedback.sql` were dirty before it
  started and are deliberately **not** staged here. `public/invite.html` carried both that
  session's copy edit and this story's `?v=` bump — only the `?v=` hunk is committed.
