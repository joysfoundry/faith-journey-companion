# Session — app-icon size, and the mark as the O

**2026-09-06 · ACTS-167 (Done) · ACTS-168 (Done)**

Forked off a chat holding ACTS-162. Started as one screenshot of JC's iPhone home screen
and ended two stories later, one of which was deliberately switched back off.

## What happened, in order

**1. The icon bug (ACTS-167).** JC: the Oravia mark sits visibly smaller in its tile than
the marks beside it. Two causes compounding.

- The mark's 100-unit canvas has **air baked in** — the ring is `r33`, so the visible mark
  is only **66 of 100 units**. ACTS-148 scaled that *whole canvas* to the tile, landing the
  mark at **40% of the tile** (72px of 180; 202 of 512) and the maskable at **30.5%**.
  Nothing looks wrong in isolation; only beside other apps.
- `apple-touch-icon.png` had **transparent corners**. iOS applies its own squircle and
  composites transparency onto black, so the navy tile was inset too.

Fix: size the tile from the **ring**, not the canvas. `0.66` for the plain icons — which
*is* the brand's own clear-space rule, so the mark goes as large as the guideline allows —
and `0.62` for the maskable, inside Android's 80% safe circle. `apple-touch-icon` and the
maskable full-bleed. `favicon.ico` gained its documented 16/24/32/48/64 frames (it had only
a 16). New `docs/brand/make_icons.py`, because the ACTS-148 generator was never committed
and the icons had no reproducible source. `sw.js` `fj-v2` → `fj-v3`, every `?v=` → `v=3`.

**2. Filed it properly.** `/spinoff` → ACTS-167, without touching ACTS-162's pointer.

**3. Deploy check, twice.** After the first push the live site still served the old icons —
live `sw.js` read `fj-v2`, which is what made it decisive: not a CDN cache of one image but
a stale build. JC published; the re-check found all five icons **byte-identical to the
repo** and `sw.js` on `fj-v3`.

**4. The wordmark (ACTS-168).** JC asked for the mark set *inside* the word as its O.
Built the specimen sheet, then the component, wired to both `Brand.tsx` and
`gate-shell.tsx` behind one flag shipping `false`. Synced to claude.ai/design.

**5. Then it went live, grew, and came back off.** JC asked to see it → flag on, shipped.
Asked for the header bigger → 20 → **24px**. Looked at it in the real app → **off again**.
Everything stays behind the flag; `true` restores it in one edit.

## The finding that decided ACTS-168
**As the O, the mark can only be letter-sized.** Beside the word it was a 30px mark next to
20px text — a ring **21.6px** across, 1.5× the type, free to be any size. Bound to the type
it is **13.3px** at 20px, and **16.0px (74%)** even at the raised 24px. Breaking even needs
**32px** type — a different header, not a bump — or 28px+, where the mark swaps to the
regular cut and becomes a different shape. If revisited: **raise `fontSize`, never `FIT`.**

## Verified (and how)
- **Pixel measurement** of every generated icon — ring/tile, centring, corner alpha, `.ico`
  frame list — plus an iOS-squircle before/after render at home-screen size.
- **Against the live deploy**, by sha256, after each of JC's publishes.
- **The wordmark flag flipped both ways** against the running dev server, not reasoned
  about: off → plain `h1`, zero SVG; on → all four surfaces switch, ring **22.0px measured
  against 22.0 expected**, gate `h1` still computing an accessible name of **"Oravia"** not
  "ravia"; at 375px no overflow.
- `tsc --noEmit` clean throughout. `make_about.py` / `make_flyer.py` re-run clean against
  the refactored `mark.py`.

## Two corrections made mid-session
- **I told JC the design-system row "matches what ships." It didn't.** SVG centres a stroke
  on its path, so `r33 + stroke 6` reaches 36 either side — visible diameter **72** units,
  not `2r` = 66. The previews drew the mark at full tile width and overstated the icon by
  ~10%. **Pillow is the opposite** (`ellipse` strokes *inside* the bbox, giving 2r), which
  is why the PNGs were right and only the HTML was wrong. Fixed in `8808b47`; both formulas
  now sit where they are used, each warning against the other.
- **A placeholder hash `4e...` reached the board**, written before the commit existed. Fixed
  in `69fb131` — a follow-up, never an amend.

## Git state at handoff
14 commits. **All pushed by JC except the last two**, which are **committed and NOT
pushed**: `3478d35` (flag back off) and `2bd4f77` (the two story closes). `git push` fails
from this environment (`could not read Username`) every time — JC pushes.

**Untouched all session, and deliberately:** `public/invite.html` (copy hunk),
`src/routes/about.tsx`, `stories/ACTS-162.md`, `supabase/migrations/0003_feedback.sql` —
dirty before this fork started, belonging to a concurrent ACTS-162 session. `invite.html`
carried *both* that session's copy edit and this session's `?v=` bump, so only the `?v=`
hunk was ever committed.

## Parked / next
- **The one step only JC can take:** iOS snapshots a home-screen icon when the site is
  added, so republishing does not update one already there. The Oravia icon must be deleted
  and re-added from Safari. Recorded rather than left open — he closed without reporting.
- **ACTS-168 if revisited:** write the integration test asserting the mark SVG is *absent*
  while the flag is off before anything else — that is what stops it shipping by accident.
  Blocked on the ACTS-92 harness.
- `make_og.py` still dies from the repo root (hardcoded `../../public/`). Pre-existing,
  untouched, unfiled.
- The `www.myoravia.lovable.app` host fails TLS; the beta is the apex.

## Next session — opener (paste to start)

> Oravia (`faith-journey-companion`). Last session closed **ACTS-167** (app icons were
> rendering at 40% of their tile — now 66%, generator at `docs/brand/make_icons.py`) and
> **ACTS-168** (the mark-as-the-O wordmark: built, shipped, reviewed live, and turned back
> off — it lives behind `WORDMARK_LOCKUP_ENABLED` in
> `src/components/layout/OraviaWordmark.tsx`, currently `false`).
>
> Two commits may still be unpushed — check `git log @{u}..HEAD` before anything else;
> `git push` does not work from the Claude environment, JC pushes by hand.
>
> The tree is dirty from a **concurrent ACTS-162 session** (`invite.html`, `about.tsx`,
> `stories/ACTS-162.md`, `supabase/migrations/0003_feedback.sql`) — do not stage those.
>
> Next id is **ACTS-169** (`stories/.counter` holds the last-used number). Run `/stories`
> for the board.
