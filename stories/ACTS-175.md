---
id: ACTS-175
title: "App-load splash — the Oravia mark with the compass bezel circling"
spine: ACTS-175
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-148, ACTS-168]
started_at: 2026-09-08T04:19:07-0700
updated:    2026-09-08T04:19:07-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone opening Oravia, I want a brief branded loading state while the app comes
up — the Oravia mark with the compass bezel **circling** — so the first paint feels
intentional and calm instead of a bare flash before the Home screen appears.

## Context
JC: "story loading animation on app load. the mark maybe the circle circling."

The app is local-first: `AppStoreProvider` (`src/components/app-store-provider.tsx`)
starts from a seed DB, then a mount effect calls `loadDatabase()` and flips a `ready`
flag — that flip is the real "app has loaded" moment, and until this story nothing was
shown there (children rendered immediately over the seed data). The mark itself already
exists as `OraviaMark` (ACTS-148): a ring that reads as compass + cross, the cross fixed
by its long vertical axis. The natural animation is the **compass bezel turning around
the fixed cross** — turn the whole ring and it would carry the cross with it and stop
reading as a cross.

## Plan
1. New `OraviaSplash` component: full-screen overlay on `bg-background`, the mark drawn
   large (two stacked SVGs) — a faint full ring + the fixed cross underneath, a gold
   ~30% arc sweeping the bezel on top. Rotation is a CSS class so it animates on the
   SSR'd paint before hydration and stops under `prefers-reduced-motion`.
2. Keyframes `oravia-splash-spin` (2.4s linear) + reduced-motion guard in `styles.css`.
3. Wire into `AppStoreProvider`: a `splash` state (`show → fading → gone`), held for a
   minimum beat once `ready` so the bezel visibly circles, then cross-faded out and
   unmounted. Starts `"show"` on server and client (no hydration mismatch).

## Acceptance criteria
- [x] On app load the Oravia mark shows centered on the background with the gold bezel
      arc circling the fixed cross. _Browser-verified: arc rotated between two shots._
- [x] Once the local DB is ready the splash cross-fades out and reveals the app; it does
      not linger or block interaction. _Verified: caught mid-fade, then Home interactive._
- [x] The animation is pure CSS and halts under `prefers-reduced-motion` (arc holds
      static, no rotation).
- [x] Colors come from theme tokens (gold bezel, foreground cross, border ring) — correct
      in light and dark without a second copy.
- [x] No hydration mismatch (splash renders `"show"` on both server and client).
- [x] `tsc --noEmit` clean; no console errors.

## Outcome — DONE 2026-09-08
New `src/components/layout/OraviaSplash.tsx` (reuses `REGULAR_CROSS` from `OraviaMark` so
the splash cross can't drift from the real mark), keyframes + reduced-motion guard in
`src/styles.css`, and the `show → fading → gone` lifecycle in `app-store-provider.tsx`
(`SPLASH_MIN_MS = 650`, `SPLASH_FADE_MS = 500` matched to the `duration-500` fade). The
bezel is a rotated whole `<svg>` element (reliable everywhere) rather than a spun path.
Browser-verified in the dev server: the gold arc visibly moved between two shots, then
the overlay cross-faded to reveal Home; `tsc` clean, zero console errors. Presentation
only — no data shape, no `STORAGE_KEY` bump.

## Tests
_Convention ACTS-91._
- **Unit** (Vitest — `src/lib/**`): N/A — no pure logic; the arc geometry is derived
  constants and the animation is CSS.
- **Integration** (Testing Library): render `AppStoreProvider` → a `role="status"`
  "Loading Oravia" overlay is present before `ready`, and is removed after the DB loads
  and the fade completes.
- **E2E** (Playwright — see the plan): N/A until a runner exists; browser-verified by hand.
