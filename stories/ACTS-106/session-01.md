---
story: ACTS-106
session: 01
wrapped_at: 2026-08-29T19:01:29-0700
status: Done
final: true
---

## What happened
Closed ACTS-106 — seed update for prayers/reading around the dead + a Home surfacing fix.

- **Eternal Rest Prayer** seeded as a reusable `Prayer` (`eternal-rest`, devotional/vocal),
  tagged `dead / departed / requiem / funeral / eternal rest`, with a new `src-eternal-rest`
  web `Source` (mycatholicprayers.com, "Traditional (public domain)"). Body = traditional
  concise form. This is the component ACTS-107 (Litany of the Departed) will reuse.
- **"Why We Are Catholic" → "Why We're Catholic"** (real book title) on the already-seeded
  Trent Horn `know-why-we-are-catholic` item, and set `favorite: true` on its Amazon link so
  it **pins on the Home Vessels card** (`pinnedLinks` is the Home surfacing mechanism —
  status is irrelevant to Home, so reading status left `not_started` to avoid a false claim).
- **STORAGE_KEY** bumped `v29 → v30` for the one-time reseed.

Files: `src/lib/prayer/seed.ts`, `src/lib/prayer/store.ts` (+ pointer/board docs).

## Verified (and how)
- `npx tsc --noEmit` — clean.
- Browser (localhost:8080): Home **Vessels** card shows the **Why We're Catholic** pin
  (→ Amazon); `/prayers` lists **Eternal Rest Prayer**; `/prayer/eternal-rest` detail renders
  body, taxonomy (Devotional · Vocal · Traditional), tags, and the **Source** link to
  mycatholicprayers.com. No console errors.
- **All 5 acceptance criteria met** (checked off in the pointer).

## Git state at handoff
- Committed to `main`: `30aeddf` (code), `c000d8b` (docs). This final handoff commits after.
- **PUSH PENDING** — `git push origin main` failed on GitHub auth
  (`could not read Username`) in this environment; push from a git client with credentials.
  (Same as the ACTS-102 push gap.)

## Next
- Push `main` when at an authed git client.
- **ACTS-107** — Litany of the Departed devotion (Rosary + Litany) is parked and depends on
  this prayer; work its structure + exact wording next chat.
- Optional tweaks JC may want: reclassify the prayer Liturgical vs Devotional; flip the book
  to `in_progress` if it should read as currently-reading.
