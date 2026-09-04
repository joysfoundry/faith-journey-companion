# Oravia — brand assets

Brand-reveal collateral from the **ACTS → Oravia** rebrand (ACTS-144). Shareable pieces to send
to beta testers alongside the app link.

## Files
- **`oravia-about.png`** — the About page on a compact one-page card (smaller body, border cropped
  to the content), with the beta link. The one to screenshot/text with the beta invite.
  Regenerate with `python3 make_about.py`.
- **`oravia-flyer.png`** — a punchier portrait flyer (1080×1920 @2x) — shorter copy, big display.
  Regenerate with `python3 make_flyer.py`.
- **`oravia-brand.html`** — the web version of the brand/About page (published as a private
  Artifact; share via its Share menu). Same content as the About card.
- **`make_about.py` / `make_flyer.py`** — Pillow generators for the two PNGs. Edit copy/sizing
  here and re-run (uses macOS Georgia/Helvetica system fonts).

## Brand voice used here
- Name **Oravia** (*ora* "pray" + *via* "the way"), tagline **"Your devotional life, gathered."**
- Blessing **"God is weaving something beautiful through your life."**
- Sign-off **"Keep your seeking for God."**
- Beta URL (once published): **www.myoravia.lovable.app**

See the app's own About page (`src/routes/about.tsx`) for the canonical copy, and the ACTS-144
story for the full decision record.
