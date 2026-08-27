---
id: ACTS-94
title: Guest "follow-along" share — read-only session view via URL fragment (+ QR best-effort)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-93, ACTS-90, ACTS-82, ACTS-76]
started_at: 2026-08-27T11:43:58-0700
updated:    2026-08-27T11:43:58-0700
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
- [ ] **Encode/decode:** compile the current session → keep only guest-rendered fields
      (`kind/title/body/reference/repetition_*/configuration`) + cover → compress
      (lz-string `compressToEncodedURIComponent` or equiv) → fragment. Decode is the inverse.
      Version the payload (`v: 1`) and fail gracefully on an unknown/garbled payload.
- [ ] **Guest view:** cover header (**date · title · purpose · info**) + the **fully-expanded**
      prayer list, **read-only** (reuse `ItemView` from `session.$sessionId.tsx:535`; drop
      tap-to-complete, Finish, keep-awake). Self-paced scroll. Mobile-first, works offline
      once loaded.
- [ ] **New `info` field:** free-text blurb captured on the session/session-context and
      surfaced in the cover. (Small addition to the builder — confirm placement with JC.)
- [ ] **Leader Share sheet:** copyable link + native share; **QR code best-effort** — show
      the QR only when the fragment fits (~<2 KB, i.e. short sessions per the ACTS-93 table),
      otherwise show link-only with a one-line "too long for a QR — share the link" note.
- [ ] **Out of scope:** live-sync ("advance together"), backend hosting, guest completion
      tracking → separate future stories.

## Notes / grounding (from ACTS-93)
- Compiler already emits self-contained text steps; render needs zero DB lookups
  (`src/lib/prayer/compiler.ts:402`, `SessionItem` in `types.ts:418`).
- Measured fragment sizes (compressed, base64url): full rosary ~3.1 KB, Caro rosary ~5.2 KB,
  litany ~0.7 KB. **Link works for all; QR only for short sessions.** Probe:
  `stories/ACTS-93/payload-probe.mts`.
- No backend today (`store.ts` localStorage-only, `prayer-companion-db-v22`). A future
  hosted `/s/<id>` (ACTS-82) would shorten links + unlock QR for long sessions.

## Tests
_Per ACTS-91 convention. No runner yet (harness = ACTS-92) → planned._
- **Unit** (Vitest — `src/lib/**`): round-trip `encode(decode(x)) === x` for the share codec;
  cover-field extraction; graceful failure on a corrupt/short/unknown-version fragment.
- **Integration** (Testing Library): `/follow` renders cover + read-only items from a fixture
  fragment; assert no complete/Finish controls; assert an invalid fragment shows a friendly error.
- **E2E** (Playwright — add to `docs/E2E-TEST-PLAN.md`): leader opens Share → copies link →
  new context opens link → sees read-only session (cover + first/last prayer), no app chrome.
