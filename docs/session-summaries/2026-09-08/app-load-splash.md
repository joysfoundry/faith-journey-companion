# Session — app-load splash (the compass bezel circling)

Date: 2026-09-08 (local). Story: **ACTS-175** (filed + built + Done, pushed). Plus a
non-story diagnosis of the pre-existing ACTS-162 working-tree changes.

## What happened (in order)
1. **ACTS-175 — App-load splash.** JC: "story loading animation on app load. the mark
   maybe the circle circling." The app is local-first, so the real "loaded" moment is
   `AppStoreProvider` flipping `ready` after `loadDatabase()` — nothing was shown there
   before (children rendered straight over the seed).
   - New [`src/components/layout/OraviaSplash.tsx`](../../../src/components/layout/OraviaSplash.tsx):
     full-screen overlay on `bg-background` drawing the ACTS-148 mark large — a faint
     full ring + the **fixed cross** (reusing `REGULAR_CROSS` from `OraviaMark`, so it
     can't drift from the real mark) with a gold ~30% arc **sweeping the bezel** on top.
     The arc is a **rotated whole `<svg>` element** about its own centre (reliable
     everywhere), not a spun path — turning the whole ring would carry the cross and it
     would stop reading as a cross.
   - [`src/styles.css`](../../../src/styles.css): `@keyframes oravia-splash-spin` (2.4s
     linear) **+ a `prefers-reduced-motion` guard** that halts the rotation (arc holds
     static). Pure CSS, so it animates on the SSR'd first paint before hydration.
   - [`src/components/app-store-provider.tsx`](../../../src/components/app-store-provider.tsx):
     a `show → fading → gone` lifecycle gated on `ready` (`SPLASH_MIN_MS = 650` so the
     bezel visibly circles, `SPLASH_FADE_MS = 500` matched to the `duration-500`
     cross-fade). Starts `"show"` on **both server and client** → no hydration mismatch.
   - Colours are theme tokens (gold bezel / foreground cross / border ring) → correct in
     light + dark without a second copy. Presentation only — **no data shape, no
     `STORAGE_KEY` bump**.
   - Filed [`stories/ACTS-175.md`](../../../stories/ACTS-175.md), added the backlog row in
     `docs/JIRA-BACKLOG.md`, bumped `stories/.counter` → 175.
2. **Non-story — diagnosed the leftover working-tree files.** JC asked why
   `public/invite.html` and `src/routes/about.tsx` were uncommitted. Both carry the **same
   one edit**: the mirrored "Everything stays with you" privacy paragraph, softening
   "nothing is sent to a server" → "nothing leaves this device unless you send it: a share
   link, an export, or feedback" (share = ACTS-94, export = ACTS-157, feedback = ACTS-162).
   File mtimes show `about.tsx` (17:37), the `0003_feedback.sql` migration (17:42) and
   `stories/ACTS-162.md` (17:43) were edited in the **same ~6-min sitting on Sep 5** =
   the ACTS-162 session; `invite.html` (Sep 6 01:14) is the next-day mirror sync.
   **JC's call: leave all four for ACTS-162**, to be committed when that feature is ready.

## Verified (and how)
- **Browser** (dev server, port 8080): the splash rendered centered on the blue ground;
  the gold bezel arc **moved between two screenshots** (lower-left → bottom), confirming it
  circles; then the overlay **cross-faded out to reveal Home**, which was interactive.
- `read_console_messages(onlyErrors)` → **no errors**.
- `tsc --noEmit` → **clean**.
- Reduced-motion halt is by CSS (`@media (prefers-reduced-motion: reduce)`) — verified by
  code, not emulated.

## Git state at handoff
On `main`. **ACTS-175 committed AND pushed by JC** — `e108a7f` (6 files: OraviaSplash.tsx,
styles.css, app-store-provider.tsx, JIRA-BACKLOG.md, .counter, ACTS-175.md). JC confirmed
"push done 175".
**Left untouched / uncommitted on purpose** (JC's ACTS-162 work-in-progress, to be
committed with 162 when ready): `public/invite.html`, `src/routes/about.tsx`,
`stories/ACTS-162.md`, and untracked `supabase/migrations/0003_feedback.sql`.
This session's summary doc is the only thing committed by `/wrap`.

## Parked / next
- **ACTS-162 (Send feedback)** is still **In Progress** — the four leftover files above
  belong to it; JC commits them (prefixed ACTS-162) when the feature lands.
- **Splash tuning knobs** if JC wants changes: `SPLASH_MIN_MS` / `SPLASH_FADE_MS` in
  `app-store-provider.tsx`; rotation `2.4s` in `styles.css`; sweep length `0.3` (30% of
  the ring) in `OraviaSplash.tsx`.
- ACTS-175 rode no seed change, so **no publish dependency** of its own — it ships with the
  next Lovable publish from `main`.

## Next session — opener (paste to start)
> Continue Oravia. Last session (2026-09-08) shipped **ACTS-175** — an app-load splash: the
> Oravia mark with the gold compass bezel circling a fixed cross, gated on
> `AppStoreProvider`'s `ready` flag, pure-CSS spin that halts under reduced motion,
> cross-fading out to Home. Committed + pushed as `e108a7f`; browser-verified; `tsc` clean.
> Still open: **ACTS-162 (Send feedback)** is In Progress — its working-tree files
> (`public/invite.html`, `src/routes/about.tsx`, `stories/ACTS-162.md`,
> `supabase/migrations/0003_feedback.sql`) are intentionally uncommitted, to be committed
> with 162 when ready. If picking up 175 polish: knobs are `SPLASH_MIN_MS`/`SPLASH_FADE_MS`
> (provider), `2.4s` (styles.css), sweep `0.3` (OraviaSplash.tsx).
