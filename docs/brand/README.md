# Oravia — brand assets

Brand-reveal collateral from the **ACTS → Oravia** rebrand (ACTS-144). Shareable pieces to send
to beta testers alongside the app link.

## Files
- **`oravia-about.png`** — the About page on a compact one-page card (smaller body, border cropped
  to the content), with the beta link. The one to screenshot/text with the beta invite.
  Regenerate with `python3 make_about.py`.
- **`oravia-flyer.png`** — a punchier portrait flyer (1080×1920 @2x) — shorter copy, big display.
  Regenerate with `python3 make_flyer.py`.
- **`../../public/og-cover.png`** — the **link-preview card** (1200×630) a scraper shows when
  the beta link is shared (ACTS-158). Not a hand-shared piece: it is wired into the app's
  `<head>`, so it appears by itself in iMessage/Slack/Facebook/X. Regenerate with
  `python3 make_og.py` and **bump the `?v=` on `OG_IMAGE` in `src/routes/__root.tsx`** —
  scrapers cache the old image hard.
- **`../../public/invite.html`** — the About card **as a page**, served from the app's own
  origin at **`myoravia.lovable.app/invite.html`** (ACTS-160). The one to send with the beta
  link: it reflows on a phone (the PNG needs pinch-zoom), the beta URL is tappable, and
  `@media print` turns ⌘P into a clean PDF. Lives in `public/` so it is handed straight to
  the browser — **outside the beta gate**, no passcode or account to read it. Same palette
  as `oravia-about.png`, but set in the app's own Cormorant Garamond + Karla rather than the
  PNG's Georgia (a Pillow limitation, not a brand choice).
- **`mark.py`** — the cross-in-compass, transcribed from `public/oravia-mark.svg` and
  imported by all three generators. The mark was hand-drawn in each of them before, which
  is how the flyer kept a retired identity unnoticed. Change the SVG first, then this.
- ~~`oravia-brand.html`~~ — **deleted** (ACTS-159). The old dark-blue web version; its
  published artifact carried the superseded flame-and-open-O mark, no beta link, and
  pre-trim copy. Replaced by `oravia-about.html` above. Recoverable from git history if
  the dark treatment is ever wanted again; `docs/brand/design-system/brand/mark-at-size.html`
  still cites it as the source of the retired mark, which is left as the historical record.
- **`make_about.py` / `make_flyer.py` / `make_og.py`** — Pillow generators for the PNGs. Edit copy/sizing
  here and re-run (uses macOS Georgia/Helvetica system fonts).

## Brand voice used here
- Name **Oravia** (*ora* "pray" + *via* "the way"), tagline **"Your devotional life, gathered."**
- Blessing **"God is weaving something beautiful through your life."**
- Sign-off **"Keep your seeking for God."**
- Beta URL (once published): **myoravia.lovable.app**

See the app's own About page (`src/routes/about.tsx`) for the canonical copy, and the ACTS-144
story for the full decision record.
