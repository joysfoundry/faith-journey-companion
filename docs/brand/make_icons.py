#!/usr/bin/env python3
"""Regenerate the Oravia app-icon set from the shared mark geometry.

    python3 docs/brand/make_icons.py

Writes favicon.ico, icon-192, icon-512, icon-maskable-512 and apple-touch-icon into
BOTH public/ and docs/brand/design-system/brand/assets/ (the design-system copies are
what the brand pane shows, so they must not drift from what ships).

Sizing -- the point of this file
-------------------------------
The mark's 100-unit canvas already carries ~17 units of air on every side: the ring is
only 66 of the 100. Scaling that whole canvas to the tile therefore buries a 40%-wide
mark in a 100%-wide box, which is what the first cut of these icons did -- next to a
stock iOS icon it read as a small dot in a navy square.

So the tile is sized from the RING, not the canvas. RING_FRAC is the visible ring
diameter as a fraction of the tile:

  · 0.66 for the plain icons -- exactly the brand's own clear-space rule (a quarter of
    the diameter on every side => tile = 1.5 x diameter). Any larger and the mark
    breaks its own guideline.
  · 0.62 for the maskable, comfortably inside Android's guaranteed safe zone (a circle
    of 80% diameter). The mark is effectively circular, so nothing can be cropped.

Deploying
---------
Icons are served stale-while-revalidate by public/sw.js and /icon-192.png is precached,
so new files alone do NOT reach existing installs. Bump VERSION in sw.js and the ?v=
query on every icon reference (src/routes/__root.tsx, manifest.webmanifest,
public/invite.html, the sw.js shell list) whenever this script is re-run.
"""
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mark import REGULAR, SMALL, draw_mark  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT_DIRS = [
    os.path.join(ROOT, "public"),
    os.path.join(ROOT, "docs", "brand", "design-system", "brand", "assets"),
]

CREAM = (244, 236, 216)
NAVY_TOP = (44, 74, 125)     # #2c4a7d
NAVY_BOTTOM = (20, 45, 85)   # #142d55

RING_FRAC = 0.66             # plain icons: the brand clear-space rule
RING_FRAC_MASKABLE = 0.62    # inside Android's 80%-diameter safe circle
CORNER_FRAC = 0.20           # matches the iOS squircle closely enough at a glance
SS = 4                       # supersample for the rounded corners


def _tile(size, radius_frac):
    """A navy vertical-gradient tile, rounded unless radius_frac is 0."""
    n = size * SS
    grad = Image.new("RGB", (1, n))
    gp = grad.load()
    for y in range(n):
        t = y / max(1, n - 1)
        gp[0, y] = tuple(
            round(a + (b - a) * t) for a, b in zip(NAVY_TOP, NAVY_BOTTOM)
        )
    tile = grad.resize((n, n)).convert("RGBA")
    if radius_frac:
        mask = Image.new("L", (n, n), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, n - 1, n - 1], radius=round(n * radius_frac), fill=255
        )
        tile.putalpha(mask)
    return tile.resize((size, size), Image.LANCZOS)


def icon(size, ring_frac=RING_FRAC, radius_frac=CORNER_FRAC, cut=REGULAR):
    """One app icon: the mark centred on a navy tile, scaled from the ring."""
    tile = _tile(size, radius_frac)
    # Pillow's ellipse() strokes INSIDE the bounding box, so the visible outer diameter
    # here is 2r of the mark's 100-unit canvas. Do NOT port this formula to SVG, which
    # centres a stroke on its path and so reaches 2*(r + stroke/2) = 72 units instead --
    # the same off-by-a-stroke in the other direction.
    canvas = round(size * ring_frac * 100 / (2 * cut["r"]))
    if (size - canvas) % 2:  # keep the paste offset whole, so the mark sits dead centre
        canvas += 1
    m = draw_mark(canvas, CREAM, cut)
    off = (size - canvas) // 2
    tile.alpha_composite(m, (off, off))
    return tile


def main():
    # apple-touch-icon is full-bleed: iOS applies its own squircle, and any transparency
    # left in the corners gets composited onto black rather than onto the home screen.
    files = {
        "apple-touch-icon.png": icon(180, radius_frac=0),
        "icon-192.png": icon(192),
        "icon-512.png": icon(512),
        "icon-maskable-512.png": icon(
            512, ring_frac=RING_FRAC_MASKABLE, radius_frac=0
        ),
    }
    # The .ico carries its own sizes; below 20px the regular cut dissolves, so those
    # frames use the small cut (heavier ring, shorter arms).
    ico_sizes = [16, 24, 32, 48, 64]
    frames = [
        icon(s, radius_frac=0.22, cut=SMALL if s <= 20 else REGULAR) for s in ico_sizes
    ]

    for d in OUT_DIRS:
        os.makedirs(d, exist_ok=True)
        for name, im in files.items():
            im.save(os.path.join(d, name))
        frames[-1].save(
            os.path.join(d, "favicon.ico"),
            format="ICO",
            sizes=[(s, s) for s in ico_sizes],
            append_images=frames[:-1],
        )
        print("wrote", d)


if __name__ == "__main__":
    main()
