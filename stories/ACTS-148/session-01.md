---
story: ACTS-148
session: 01
wrapped_at: 2026-09-04T16:20:00-0700
status: Done
final: true
---

## What happened
Built the Oravia design system, designed and **shipped the brand mark**, and tuned the live
palette to match it. The full warm palette was built, verified, and then deliberately **not**
shipped.

Two phases in one chat:

**Phase 1 — palette + design system.** Mocked the Marian palette in a real Claude Design
design-system project (`/design-sync`), settled the direction, applied Illuminated to the app,
browser-verified it, then reverted it on JC's call to launch on the existing blue.

**Phase 2 — the mark.** Found JC's original compass, designed the cross-in-compass mark from it,
shipped the icon set, harmonised the live palette's blues and golds to it, and put the mark in
the app header.

## Decisions locked
- **Direction: Illuminated** (parchment paper, gold section bands, burgundy liturgical marks).
  The *richer* variant was explored against a Marian painting JC supplied and **kept as its own
  card**, not adopted.
- **Launch on blue.** JC: *"don't make changes to app yet. I will launch with blue for now."*
  Illuminated is staged, not shipped.
- **Mark: variant 5a, "the cross in the compass."** A gold ring reading three ways — the **O**
  of Oravia, a **compass** bezel, and a **cross**, because the vertical runs long (60 units vs
  42) and the crossbar sits above centre (y42).
- **Dark mode ships later** → [ACTS-150](../ACTS-150.md).
- **Shipping Illuminated** → [ACTS-151](../ACTS-151.md).

## What is live in the app
- **The mark**, as `OraviaMark.tsx`, in the header via `Brand.tsx` (mobile header, desktop
  side rail, mobile drawer).
- **The icon set** — `favicon.ico` (multi-res), `icon-192/512`, `icon-maskable-512`,
  `apple-touch-icon`, `oravia-mark.svg`. **This removed Lovable's default heart favicon**,
  which had been shipping in the beta.
- **A harmonised palette** — 16 tokens moved so the blues and golds are the *exact* Marian
  values the mark is drawn from. Surfaces deliberately untouched.

## Things that would have bitten
- **The favicon would not have shipped by copying files.** `sw.js` served images
  stale-while-revalidate and precached `/icon-192.png`, so existing users would have kept the
  old icons indefinitely. Fixed by bumping `VERSION` `fj-v1` → `fj-v2` (the file's own header
  documents this as the deploy step) and adding `?v=2` to the icon links, manifest srcs, and
  the shell precache.
- **Dark mode is unreachable dead code.** `.dark` tokens have existed for a while but nothing
  in `src/` ever adds the class → ACTS-150.
- **`--gold` was referenced by zero components.** It now drives `--accent` in Illuminated.
- **Gold cannot carry text.** It fails AA on every warm surface, so `--gold-ink` exists for
  words; `--gold` is fill/rule/mark only.
- **Illuminated's deeper ground broke `--muted-foreground`** (4.50 on the gold band, 4.29 on
  secondary). Darkened to `oklch(0.455 0.036 264)`; worst case now 4.68.
- **Burgundy and destructive are both dark reds.** Rule adopted: burgundy never fills a button.
- **The design-system pane only indexed the first push.** Its compiled `_ds_manifest.json` held
  11 of 22 cards and `register_assets` did not take. The manifest is now generated from each
  file's `@dsCard` marker with tokens re-derived from `tokens.css`, so a later recompile agrees.

## Corrections made along the way
- Told JC the canvas could not sync to claude.ai/design. **Wrong** — `/design-sync` exists and
  is what we used, after a one-time `/design-login`.
- Direction mockups initially invented Home's content (wrong sections, 4-item nav). Rebuilt from
  `src/routes/index.tsx`: Prayer & Devotion / Word / Vessels / Reflection, six-item nav.
- Missed the free-write composer in the Reflection section entirely; rebuilt from
  `ReflectionComposer.tsx`.
- Reported live contrast ratios of 1.03 and 2.50 from a browser probe — junk, caused by parsing
  `oklab()` strings as RGB. The sRGB math was and is correct.
- "Before & after" compared original vs Illuminated, hiding the state actually shipping. Replaced
  with "Three palettes", each badged.

## State
- `main` in sync with `origin/main`; everything pushed.
- Design system: 22 cards, four groups, in the **Oravia Design System** project on
  claude.ai/design, mirrored at `docs/brand/design-system/`.
- `src/` clean; `tsc` clean. No `STORAGE_KEY` bump.
- `.env` is modified in the working tree — pre-existing, not from this work.

## Acceptance criteria
All met, with one deliberate substitution: the palette shipped as the **harmonised** set rather
than Illuminated, at JC's direction. Illuminated is fully built and verified, preserved as
`stories/ACTS-148/illuminated-app.patch`, and tracked as ACTS-151.

## Open, tracked elsewhere
- **ACTS-150** — wire dark mode.
- **ACTS-151** — ship Illuminated.
- **Burgundy still has no home.** `LiturgicalDay` computes `season` and `color` for every day,
  so an always-on hook exists; nothing renders it.
- **Karla vs Mulish** — the app and the printed collateral still disagree. Recommendation in the
  Type card is Mulish.
