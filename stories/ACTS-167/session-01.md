---
story: ACTS-167
session: 01
wrapped_at: 2026-09-06T01:50:49-0700
status: Done
final: true
---

## What happened
JC screenshotted his iPhone home screen: the Oravia mark sat visibly smaller in its tile
than the marks beside it. **Two causes compounding.**

1. **The mark's canvas has air baked in.** `public/oravia-mark.svg` is a 100-unit viewBox
   with the ring at `r33`, so the visible mark is only **66 of 100 units**. ACTS-148 scaled
   that *whole canvas* to the tile, landing the mark at **40% of the tile** (measured 72px
   of 180; 202 of 512) and the maskable at **30.5%**. Nothing looks wrong in isolation —
   only beside other apps.
2. **`apple-touch-icon.png` had transparent corners.** iOS applies its own squircle and
   composites transparency onto black, so the navy tile was inset too.

Fix: size the tile from the **ring**, not the canvas. `ring_frac` **0.66** for the plain
icons — which *is* the brand's own clear-space rule, a quarter-diameter each side, so the
mark goes as large as the guideline allows and no larger — and **0.62** for the maskable,
inside Android's 80% safe circle. `apple-touch-icon` and the maskable are now full-bleed;
the `purpose:"any"` PNGs keep their 20% corners. `favicon.ico` gained the documented
**16/24/32/48/64** frames (it carried only a 16), small cut below 20px.

Added **`docs/brand/make_icons.py`** — the ACTS-148 generator was never committed, so the
icons had no reproducible source. It writes both `public/` and the design-system assets and
resolves from `__file__`. `mark.py` grew `REGULAR`/`SMALL` geometry constants.

Bumped `sw.js` `VERSION` `fj-v2` → **`fj-v3`** and every `?v=` → `v=3`.

## Verified (and how)
- **Pixel measurement** of the generated PNGs: ring/tile 0.656–0.660 (was 0.40), maskable
  0.621 (was 0.305), mark centred to the pixel, `apple-touch-icon` corner alpha 255.
- **iOS-squircle before/after render** at home-screen size, shown to JC.
- **Against the live deploy after JC published:** all five icons fetched from
  `myoravia.lovable.app` are **byte-identical to the repo** (sha256), and live `sw.js`
  reads `fj-v3`.
- `tsc --noEmit` clean. `make_about.py` / `make_flyer.py` re-run clean against the
  refactored `mark.py`.

## Things that would have bitten
- **A wrong preview shipped in the same story and had to be corrected.** The design-system
  app-icon previews drew the mark SVG at the full tile width, rendering the ring at 72% of
  the tile against the PNGs' actual 66% — the doc overstated the icon by ~10%. Cause:
  **SVG centres a stroke on its path**, so `r33 + stroke 6` reaches 36 either side and the
  visible outer diameter is **72** units, not `2r` = 66. **Pillow is the opposite** —
  `ellipse(bbox, width=w)` strokes *inside* the box and does give 2r — which is why the
  generated PNGs were right and only the HTML was wrong. Both formulas are now stated where
  they are used, each warning against the other. Fixed in `8808b47`.
- **Icons never ship by replacing files** — `sw.js` serves images stale-while-revalidate and
  precaches `/icon-192.png`. Same trap as ACTS-148.
- **`make_og.py` dies from the repo root** (hardcoded `../../public/`) — pre-existing `cwd`
  bug, unrelated; `og-cover.png` left untouched.
- **The `www.` host fails TLS** — the beta is the apex `myoravia.lovable.app`.

## Git state at handoff
Committed and **pushed by JC**: `164a522` (code), `e8b9334` (docs), `4239b1f` (hashes),
`8808b47` (preview correction). `git push` fails from this environment
(`could not read Username`) throughout — JC pushed every time.

## Next
Nothing. All acceptance criteria met.

One step only JC can take, and it is **not** a defect: iOS snapshots a home-screen icon when
the site is added, so republishing does not update one already there — the Oravia icon has to
be deleted and re-added from Safari. JC was told this; he did not report back either way and
closed the story, so it is recorded here rather than left as an open criterion.
