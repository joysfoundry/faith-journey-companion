---
id: ACTS-94
title: Guest "follow-along" share — read-only session view via URL fragment (+ QR best-effort)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-93, ACTS-90, ACTS-82, ACTS-76]
started_at: 2026-08-27T11:43:58-0700
updated:    2026-08-27T11:48:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone leading a group prayer session (e.g. the monthly family rosary), I want to
**share a link** that opens a **read-only, self-paced view** of the session's prayers, so
guests **without the app** can follow along in their phone browser — no install, no account.

Implements the direction settled in **ACTS-93** (see its Decisions + measured payload probe).

## Acceptance criteria
- [ ] **Public route** (e.g. `/follow`) — no auth, no store dependency; renders entirely
      from the URL **fragment** (`/follow#<payload>`), which never reaches a server.
- [x] **Encode/decode:** `src/lib/prayer/share.ts` — compiles guest-rendered fields
      (`kind/title/body/reference/repetition_*/configuration`) + cover → lz-string
      `compressToEncodedURIComponent` → fragment; `decodeShare` is the inverse and returns
      `null` (never throws) on empty/garbled/wrong-`v`/wrong-shape. `v` tag is a
      **validation gate only**; **no back-compat**. Cover is identity-free (`title`+`date`
      from session; `purpose`+`info` sharer-authored at share time). ✅ Phase 1 landed.
- [ ] **Guest view:** cover header (**date · title · purpose · info**) + the **fully-expanded**
      prayer list, **read-only** (reuse `ItemView`; drop tap-to-complete, Finish, keep-awake).
      Self-paced scroll. Mobile-first, works offline once loaded.
  - [x] **Phase 2 — `ItemView` extracted** to `src/components/prayer/ItemView.tsx` (with its
        `DecadeTag`/`decadeOrdinal` helpers); `session.$sessionId.tsx` imports it. Pure,
        behavior-preserving move — `tsc --noEmit` + eslint clean. ⚠️ Live browser re-check of
        Prayer Mode still pending (blocked: the Vite config is pinned to :8080, held by a
        concurrent dev server → do it once that's free, or after `/save`).
- [ ] **New `info` field:** free-text blurb captured on the session/session-context and
      surfaced in the cover. (Small addition to the builder — confirm placement with JC.)
- [ ] **Leader Share sheet:** copyable link + native share; **QR code best-effort** — show
      the QR only when the fragment fits (~<2 KB, i.e. short sessions per the ACTS-93 table),
      otherwise show link-only with a one-line "too long for a QR — share the link" note.
- [ ] **Handoff / re-share:** the guest `/follow` view carries the **same Share action**, so
      whoever holds the link can hand the identical session to the next person — **not tied to
      the original sender**, no app required. Reuses the same `ShareSheet` + the payload the
      page already decoded.
- [ ] **Identity-free payload:** the cover carries only `title / date / purpose / info` —
      **never** a sender/user identity — so any holder can lead and re-share.
- [ ] **Out of scope:** live-sync ("advance together") + transferring a *controlling* leader
      role (that's where "handoff" gains teeth); backend hosting; guest completion tracking;
      handoff-recipient **editing** the prayers → separate future stories.

## Notes / grounding (from ACTS-93)
- Compiler already emits self-contained text steps; render needs zero DB lookups
  (`src/lib/prayer/compiler.ts:402`, `SessionItem` in `types.ts:418`).
- Measured fragment sizes (compressed, base64url): full rosary ~3.1 KB, Caro rosary ~5.2 KB,
  litany ~0.7 KB. **Link works for all; QR only for short sessions.** Probe:
  `stories/ACTS-93/payload-probe.mts`.
- No backend today (`store.ts` localStorage-only, `prayer-companion-db-v22`). A future
  hosted `/s/<id>` (ACTS-82) would shorten links + unlock QR for long sessions.

## Progress
- **Phase 1 — share codec: DONE.** `src/lib/prayer/share.ts` (+ `lz-string` dep; `@types`
  not needed — ships its own). Verified via an ephemeral `npx tsx` harness: 36 round-trip +
  rejection assertions pass; `tsc --noEmit` + eslint clean.
- **lz-string sizing reality:** its URL-safe output is weaker than the ACTS-93 deflate proxy.
  Measured fragment lengths (lz-string, not deflate): **full rosary ~10.4 KB**, litany
  ~1.4 KB, single prayer ~0.5 KB. Still fine for a **tap-to-open link** everywhere (fragments
  hold tens of KB). QR conclusion unchanged (rosary never fit). `QR_FRAGMENT_LIMIT` set
  conservative (1200) since mixed-case output forces QR **byte mode** — Phase 4's QR encoder
  is the real authority. If short links / rosary-QR ever matter → native `CompressionStream`
  (gzip, ~3 KB but async) or a hosted `/s/<id>` (ACTS-82).
- **Import note:** lz-string is CJS with no ESM/exports map → `import LZString from
  "lz-string"` + destructure (named ESM imports fail under plain Node; Vite would interop).

## Tests
_Per ACTS-91 convention. No runner yet (harness = ACTS-92) → planned. Phase-1 codec was
verified with a temporary `npx tsx` harness (36 assertions green); these become real Vitest
specs once ACTS-92 lands._
- **Unit** (Vitest — `src/lib/**`): round-trip `encode(decode(x)) === x` for the share codec;
  cover-field extraction; graceful failure on a corrupt/short/unknown-version fragment.
- **Integration** (Testing Library): `/follow` renders cover + read-only items from a fixture
  fragment; assert no complete/Finish controls; assert an invalid fragment shows a friendly error.
- **E2E** (Playwright — add to `docs/E2E-TEST-PLAN.md`): leader opens Share → copies link →
  new context opens link → sees read-only session (cover + first/last prayer), no app chrome.
