---
story: ACTS-101
session: 01
wrapped_at: 2026-08-29T01:50:13-0700
status: Done
final: true
---

## What happened
Rebranded the app from **Faith Journey** to **ACTS** (Adoration, Contrition, Thanksgiving,
Supplication), with the acronym shown in the header.

- New reusable `src/components/layout/Brand.tsx`: **ACTS** wordmark + a tagline spelling out
  the four words, wired into all three header surfaces (desktop rail, mobile top bar, mobile
  drawer).
- Renamed the app everywhere user-visible: all page/OG titles (`— ACTS`), home + root + PWA
  titles, `apple-mobile-web-app-title`, the shared-view label, and the PWA manifest
  (`name`/`short_name`); sw.js comment.

**Tagline treatment — iterated with JC to a final look:**
1. script font (Pinyon Script) with tinted initials → 2. compared six scripts (artifact)
→ 3. JC chose **non-script**: small letter-spaced **uppercase caps**, initials set
**larger** (same muted tone, **no tint**) to echo A·C·T·S. Unused script font removed.

## Verified (and how)
`tsc --noEmit` clean; `eslint` clean. Browser (dev server): desktop rail and mobile top bar
both render the ACTS wordmark + enlarged-initial caps tagline; document title shows
"ACTS — Your daily prayer companion". Mobile drawer uses the same `Brand` component.
(Note: transient "Link is not defined" console entries seen mid-edit were stale HMR buffer
from intermediate import/usage states — confirmed clean on final render.)

**Acceptance criteria:** header wordmark ✓, spelled-out tagline w/ distinguished initials ✓,
app renamed everywhere user-visible ✓, typographic direction chosen ✓ (final = non-script
enlarged caps, superseding the "script font" wording in the pointer).

## Git state at handoff
Committed-not-pushed. ACTS-101 commits on `main`:
- `8357c68` rebrand + Brand component (initial Pinyon Script version)
- `29cc20f` docs: file ACTS-101
- `efd316e` final tagline: small letter-spaced caps, enlarged initials, drop script font

**Push PENDING** — `git push origin main` fails here with `could not read Username`
(no git credentials in this environment). Push from your own git client; this flushes the
whole local backlog (ACTS-99, ACTS-100, ACTS-101).

## Next
- Push `main` from your git client.
- ACTS-101 Done. Related parked exploration: ACTS-100 (`/start ACTS-100`).
