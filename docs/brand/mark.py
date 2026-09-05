#!/usr/bin/env python3
"""The Oravia mark, for the Pillow collateral generators.

One copy, imported by make_og.py / make_about.py / make_flyer.py -- the mark was
already drawn by hand in two of them and had drifted (the flyer still carried the
retired flame-and-open-O). Geometry is transcribed from public/oravia-mark.svg;
change it THERE first, then here.
"""
from PIL import Image, ImageDraw


def draw_mark(size, color):
    """The ACTS-148 cross-in-compass as an RGBA image of `size` x `size`.

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
    md.ellipse(
        [(50 - 33) * u, (50 - 33) * u, (50 + 33) * u, (50 + 33) * u],
        outline=color + (255,),
        width=int(6 * u),
    )
    md.polygon(
        [
            (x * u, y * u)
            for x, y in [
                (50, 20), (54.2, 38.4), (71, 42), (54.2, 45.6),
                (50, 80), (45.8, 45.6), (29, 42), (45.8, 38.4),
            ]
        ],
        fill=color + (255,),
    )
    return m.resize((size, size), Image.LANCZOS)
