---
story: ACTS-205
session: 01
final: true
wrapped_at: 2026-09-15T14:00:28-0700
---

# ACTS-205 — session 01 (final)

## What happened
Made the Vessels page (`src/routes/formation.tsx`) order **alphabetically in every filter**, per
JC, while leaving Home's "Vessels with content first" behavior untouched:
- By-Vessel group sort: content-first (`byHas`) → **pure name `localeCompare`** (empty Vessels
  interleave alphabetically).
- Books filter: `byStatusThenTitle` → **alpha by book title**.
- Items within every group + the flat lists: new local `byTitle` comparator replaces
  `byStatusThenTitle` (visibleContent, per-Vessel items, book buckets, General, By-Channel items).
- By Channel already alpha by platform (unchanged). Removed the now-unused `byStatusThenTitle` import.
- Home untouched — it orders via `pinnedLinks` in `index.tsx` (separate path), still content-first.

## Verified (and how)
- `tsc --noEmit` clean.
- Live (dev :8080, /formation): By-Vessel = Ascension Press → Fr. Mike Schmitz → Fr. Venn →
  Hallow → St. Francis de Sales → St. Padre Pio → Trent Horn → USCCB → YouVersion (empty Vessels
  interleaved, not sunk). Flat "All" list alphabetical (quote first, then Bible…, Introduction…,
  Sunday Homilies…, Why We're Catholic) — completable-first gone.

## Acceptance criteria — all met
- [x] Vessels page alphabetical in every filter.
- [x] Items within a group alphabetical by title.
- [x] Home retains content-first.
- [x] No regressions (typecheck + live).

## Git state at handoff
Committed: `1d2bda3` (code) + `10f7105` (story) + this handoff. **Committed-not-pushed** — the
sandbox can't auth; JC pushes from their client (`git push origin main`).

## Next
None — ACTS-205 is Done. Backlog: ACTS-204 (typed channels, In Progress, new thread) → then
ACTS-187 (unified form); ACTS-201 (parish), ACTS-202 (author vs publisher), ACTS-203 (Tag entity).
