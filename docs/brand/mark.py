#!/usr/bin/env python3
"""The Oravia mark, for the Pillow collateral generators.

One copy, imported by make_og.py / make_about.py / make_flyer.py -- the mark was
already drawn by hand in two of them and had drifted (the flyer still carried the
retired flame-and-open-O). Geometry is transcribed from public/oravia-mark.svg;
change it THERE first, then here.
"""
from PIL import Image, ImageDraw

# The 100-unit geometry, transcribed from the SVGs. Change it THERE first, then here.
#   regular -> public/oravia-mark.svg                       (24px and up)
#   small   -> .../design-system/brand/assets/oravia-mark-small.svg (16-20px)
REGULAR = {
    "r": 33,
    "stroke": 6,
    "cross": [
        (50, 20), (54.2, 38.4), (71, 42), (54.2, 45.6),
        (50, 80), (45.8, 45.6), (29, 42), (45.8, 38.4),
    ],
}
SMALL = {
    "r": 32,
    "stroke": 8,
    "cross": [
        (50, 22), (55, 38), (68, 42), (55, 46.4),
        (50, 78), (45, 46.4), (32, 42), (45, 38),
    ],
}


def draw_mark(size, color, cut=REGULAR):
    """The ACTS-148 cross-in-compass as an RGBA image of `size` x `size`.

    `cut` is REGULAR or SMALL. The returned image is the full 100-unit canvas, so the
    visible ring is only 2r/100 of `size` -- callers that need the mark to fill a tile
    should size the canvas from the ring, not from the tile (see make_icons.py).

    Drawn at 8x and downsampled: Pillow's ellipse outline has no antialiasing, and a
    jagged ring is the first thing the eye catches on a printed piece.

    The 100-unit viewBox geometry is copied verbatim from the SVG -- the 60:42
    vertical-to-horizontal ratio and the crossbar sitting above centre are
    load-bearing. Equalise either and the cross stops reading as a cross and starts
    looking like a crosshair (see the SVG's own comment).
    """
    K = 8
    n = size * K
    m = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    md = ImageDraw.Draw(m)
    u = n / 100.0
    r = cut["r"]
    md.ellipse(
        [(50 - r) * u, (50 - r) * u, (50 + r) * u, (50 + r) * u],
        outline=color + (255,),
        width=max(1, int(cut["stroke"] * u)),
    )
    md.polygon([(x * u, y * u) for x, y in cut["cross"]], fill=color + (255,))
    return m.resize((size, size), Image.LANCZOS)
