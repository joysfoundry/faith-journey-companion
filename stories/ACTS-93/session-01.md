---
story: ACTS-93
session: 01
wrapped_at: 2026-08-27T11:43:58-0700
status: Done
final: true
---

## What happened
Explored how to share a read-only "follow-along" prayer view with guests who don't have
the app (e.g. the monthly family rosary). Dug through the compile → render path and
settled the design, then validated it with a real payload-size prototype.

**Key findings (compile → render):**
- `generatePrayerSession()` (`src/lib/prayer/compiler.ts:402`) already flattens a template
  into fully self-contained text `SessionItem`s (`types.ts:418`) — render needs **zero DB
  lookups**, so sharing only needs the compiled output.
- The running view (`session.$sessionId.tsx:117`) renders each item via a small `ItemView`
  (`:535`) taking only `item: SessionItem` → a guest view is that list, read-only.
- Persistence is **localStorage-only** (`store.ts:47`, `prayer-companion-db-v22`) — no
  backend, so slice 1 must be self-contained.

**Decisions (JC):** deliver via **URL fragment** (`/follow#<payload>`, client-side/private);
steps **fully expanded** (1:1 with the running view); guest is **read-only, self-paced**;
live-sync + hosting deferred; prayers are **public domain** (no licensing blocker).

**Payload prototype** (`stories/ACTS-93/payload-probe.mts`, `npx tsx`): compiled real seeded
sessions, compressed (deflate ≈ lz-string), measured the fragment. Full rosary = 79 steps,
25.8 KB raw → **~3.1 KB fragment**; Caro rosary ~5.2 KB; litany ~0.7 KB. **Conclusion: a
tap-to-open link works for every session; QR fits only short ones (≲2 KB).**

## Verified (and how)
- Import chain is pure (type-only imports) — ran the compiler + seed under `npx tsx` with
  no Vite/React deps.
- Probe runs green from the repo: `npx tsx stories/ACTS-93/payload-probe.mts` prints the
  size table (recorded in `ACTS-93.md`). No app code changed → no browser verification needed.

## Git state at handoff
Docs + probe committed & pushed via /save (spike only — no `src/` changes).

## Next
Implementation continues in **ACTS-94** — build `/follow` route + share codec
(compress → fragment), reuse `ItemView` read-only, add the `info` cover field, QR when it
fits. Start clean: `/start ACTS-94`.
