#!/usr/bin/env python3
"""Oravia link-preview card -> ../../public/og-cover.png (1200x630).

The image a scraper shows when the beta link is shared (ACTS-158). Sibling of
make_about.py / make_flyer.py: same brand voice, same "edit the copy here and
re-run" contract. Uses the DARK palette from oravia-brand.html on purpose -- a
deep blue card reads as something in a feed of white ones.

1200x630 is the Open Graph 1.91:1 slot. Drawn at 2x and downsampled so the
Georgia text and the hairline rules stay crisp.
"""
from PIL import Image, ImageDraw, ImageFont

from mark import draw_mark

S = 2                                  # supersample
W, H = 1200 * S, 630 * S
CX = W // 2
OUT = "../../public/og-cover.png"

# --- palette: oravia-brand.html -------------------------------------------
BLUE_HI = (28, 58, 104)                # --blue-1 lifted, the glow at top centre
BLUE_1  = (22, 48, 90)                 # Marian blue
BLUE_2  = (15, 36, 68)                 # deep vignette
IVORY   = (244, 236, 216)              # headings
IVORY_S = (216, 204, 176)              # body
IVORY_M = (159, 176, 201)              # blue-biased muted (captions)
GOLD    = (198, 161, 91)               # antique gold
GOLD_SF = (169, 138, 76)

FD = "/System/Library/Fonts/Supplemental/"
def gb(s): return ImageFont.truetype(FD + "Georgia Bold.ttf", int(s * S))
def gr(s): return ImageFont.truetype(FD + "Georgia.ttf", int(s * S))
def gi(s): return ImageFont.truetype(FD + "Georgia Italic.ttf", int(s * S))
def hv(s): return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(s * S))


def ground():
    """Radial glow from just above top-centre, falling to the vignette.

    Computed on a 150x79 grid and upscaled -- a per-pixel loop at 2400x1260
    would take ~3M iterations for a gradient no one can see the banding in.
    """
    gw, gh = 150, 79
    small = Image.new("RGB", (gw, gh))
    px = small.load()
    for yy in range(gh):
        for xx in range(gw):
            dx = (xx / gw - 0.5) / 0.60          # wide ellipse
            dy = (yy / gh + 0.10) / 0.80
            t = min(1.0, (dx * dx + dy * dy) ** 0.5)
            if t < 0.45:                          # core -> Marian blue
                k = t / 0.45
                a, b = BLUE_HI, BLUE_1
            else:                                 # Marian blue -> vignette
                k = (t - 0.45) / 0.55
                a, b = BLUE_1, BLUE_2
            px[xx, yy] = tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(3))
    return small.resize((W, H), Image.BICUBIC)


img = ground()
d = ImageDraw.Draw(img)


def center(text, font, fill, y):
    d.text((CX, y), text, font=font, fill=fill, anchor="ma")


def tracked(text, font, fill, sp, y):
    """Letter-spaced small caps -- the label voice used across the collateral."""
    sp *= S
    ws = [d.textlength(c, font=font) for c in text]
    x = CX - (sum(ws) + sp * (len(text) - 1)) / 2
    for c, w in zip(text, ws):
        d.text((x, y), c, font=font, fill=fill, anchor="la")
        x += w + sp


def rule(y, half=150):
    """Hairline with a bead at centre -- the thread, as on the About card."""
    half *= S
    d.line([(CX - half, y), (CX - 16 * S, y)], fill=GOLD_SF, width=S)
    d.line([(CX + 16 * S, y), (CX + half, y)], fill=GOLD_SF, width=S)
    r = 5 * S
    d.polygon([(CX, y - r), (CX + r, y), (CX, y + r), (CX - r, y)], fill=GOLD)


# --- frame: a gold hairline, inset clear of every platform's rounded crop ---
d.rectangle([28 * S, 28 * S, W - 28 * S, H - 28 * S], outline=GOLD_SF, width=S)

# --- the card ---------------------------------------------------------------
mk = draw_mark(92 * S, GOLD)
img.paste(mk, (CX - mk.width // 2, 62 * S), mk)

center("Oravia", gb(74), IVORY, 168 * S)
tracked("YOUR DEVOTIONAL LIFE, GATHERED", hv(17), GOLD, 5, 268 * S)
rule(318 * S)

center("Prayer, Scripture, learning, and reflection —", gi(30), IVORY_S, 358 * S)
center("woven into one daily rhythm.", gi(30), IVORY_S, 400 * S)

tracked("FREE BETA  ·  NO ACCOUNT NEEDED  ·  YOUR ENTRIES STAY ON YOUR DEVICE",
        hv(16), IVORY_M, 3, 486 * S)
center("myoravia.lovable.app", gr(24), GOLD, 526 * S)

img.resize((W // S, H // S), Image.LANCZOS).save(OUT)
print("saved", OUT, "1200x630")
