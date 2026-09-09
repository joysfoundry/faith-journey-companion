---
story: ACTS-176
session: 01
wrapped_at: 2026-09-09T00:36:20-0700
status: Done
final: true
---

## What happened
JC reported (prod): the Mater Dei Weekly Rosary's mystery version showed as "USCCB —
Scripture" in Prayers → **Mysteries** — a duplicate of the real USCCB version — while the
version inside the devotion read correctly. Traced it to a display-only bug: `mysteryVersions()`
in [`compiler.ts`](../../src/lib/prayer/compiler.ts) named a version by the **source of the
first mystery it encountered** for that `body_key`. The Mater Dei body (ACTS-172) borrows
USCCB Scripture for its 15 non-Glorious placeholders (attributed to USCCB by design), and
sets iterate Joyful first, so the whole version inherited the USCCB source name. The devotion
picker was correct because `allMysteryBodies()` uses the version **label** first. Flipped
`mysteryVersions` to prefer `label` (then source name), matching `allMysteryBodies`. One line;
no data shape change, no `STORAGE_KEY` bump.

## Verified (and how)
Local preview (v41 seed): Prayers → Mysteries now lists four distinct versions —
Reflection, USCCB — Scripture, Ascension — Meditation, **Mater Dei Catholic Church** (each 20
mysteries). Confirmed by reading the rendered version-card anchors after switching to the tab.
Devotion picker name unchanged.

## Git state at handoff
committed & pushed — code fix `3076b24` on `main` (pushed by JC; `main` in sync with
`origin/main`). Story docs for ACTS-176 committed separately (`docs:`).

## Next
None — shipped. Goes live on the next Lovable Publish from `main` (no migration needed).
