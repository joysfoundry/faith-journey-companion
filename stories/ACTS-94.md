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
- [x] **Public route** `/follow` (`src/routes/follow.tsx`) — no auth, no store, no network;
      decodes the URL **fragment** client-side (SSR-safe: neutral loading paint, then decode
      on mount; re-reads on `hashchange`). ✅ Phase 3 landed + browser-verified.
- [x] **Encode/decode:** `src/lib/prayer/share.ts` — compiles guest-rendered fields
      (`kind/title/body/reference/repetition_*/configuration`) + cover → lz-string
      `compressToEncodedURIComponent` → fragment; `decodeShare` is the inverse and returns
      `null` (never throws) on empty/garbled/wrong-`v`/wrong-shape. `v` tag is a
      **validation gate only**; **no back-compat**. Cover is identity-free (`title`+`date`
      from session; `purpose`+`info` sharer-authored at share time). ✅ Phase 1 landed.
- [x] **Guest view:** cover header (**date · title · purpose · info**, date formatted long,
      `info` keeps line breaks) + the **fully-expanded** prayer list rendered through the
      shared `ItemView`, **read-only** (no tap-to-complete, no "Now", no Finish, no keep-awake).
      Self-paced scroll, mobile-first, works offline once loaded. Loading / empty / invalid
      states all present. ✅ Phase 3 — browser-verified (real litany fragment renders; garbled
      fragment shows the friendly "reshare" message).
  - [x] **Phase 2 — `ItemView` extracted** to `src/components/prayer/ItemView.tsx` (with its
        `DecadeTag`/`decadeOrdinal` helpers + a narrowed `ItemViewData` prop that both a full
        `SessionItem` and a decoded `ShareItem` satisfy); `session.$sessionId.tsx` imports it.
        Pure, behavior-preserving move — `tsc` + eslint clean. ⚠️ Live re-check of Prayer Mode
        itself still pending (needs the :8080 dev server free).
- [ ] **New `info` field:** free-text blurb captured on the session/session-context and
      surfaced in the cover. (Small addition to the builder — confirm placement with JC.)
- [x] **Share dialog:** `src/components/prayer/ShareDialog.tsx` — copyable link + native share
      (`navigator.share`), inputs for optional **intention** + **welcome note** (leader), and a
      **best-effort QR** shown only when the full link fits `QR_FRAGMENT_LIMIT` (short sessions),
      else a "too long for a scannable code — share the link" note. Leader entry = Share icon in
      the running-session header. ✅ Phase 4 — browser-verified (leader dialog with inputs +
      link-only note; guest re-share dialog + live QR for a short session; copy writes to
      clipboard). Reused by the guest `/follow` re-share button (handoff).
- [x] **Share on upcoming/saved sessions:** Share icon added to the **Upcoming** row in
      `pray.tsx` (leftmost: Share · Edit · Duplicate · Delete · Begin), opening the same
      `ShareDialog`. Compiles the plan **without persisting** (`compilePlanSession` +
      `PlanShareButton`, mirrors the store's `startBuiltSession` path). Lets a session be shared
      *ahead of time* without starting it. ✅ browser-verified (icon renders on the row).
- [x] **Short, titled backend links (step 1): DONE + browser-verified.** Supabase was already
      connected (empty DB); added table `public.shared_sessions` (slug/payload/created_at, public
      RLS — anon insert+select, required for guest handoff) via
      `supabase/migrations/0001_shared_sessions.sql` (JC applied it). New pieces:
      `src/lib/prayer/shareStore.ts` (`createShare`→titled slug `aug-28-litany-of-humility-7k2p`,
      `fetchShare`); `src/components/prayer/FollowAlongView.tsx` (shared read-only view);
      `/follow` split into a layout (`follow.tsx` = `<Outlet/>`) + `follow.index.tsx` (fragment)
      + `follow.$shareId.tsx` (fetch by slug) — the layout split was needed because
      `follow.$shareId` nests under `follow`. `ShareDialog` now: compose → **Create share link**
      → short link + QR; **falls back to the fragment link if the backend is unreachable**; a
      re-share reuses its `existingSlug` (no duplicate row). `types.ts` got the table by hand (no
      codegen here; matched the file's no-semicolon style → minimal diff). Verified: create →
      `/follow/aug-28-pray-with-the-pope-e2af`, open it → fetch+render, reshare → same slug.
      **Long-link problem solved.**
  - Next (own stories, same Supabase connection): auth login (ACTS-87) + account creation
    (ACTS-88) — Supabase Auth, middleware already scaffolded; full persistence (ACTS-82).
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
- **Phase 2 — `ItemView` extraction: DONE** (see AC). Added exported `ItemViewData` (narrowed
  prop) so `ShareItem` renders without a full `SessionItem`; added `mystery_ordinal` to the
  payload (ItemView's mystery fallback reads it).
- **Phase 3 — `/follow` route: DONE + browser-verified** on a real litany fragment (cover +
  read-only cards render; garbled fragment → friendly reshare message; mobile layout clean).
  Verified against this session's own dev server on :8081 (the preview proxy mis-mapped the
  autoPort; navigated the in-app browser to the real bound port instead).
  - **Dark-mode note:** `/follow` uses the app's design tokens, so it follows the app theme.
    The app does not switch on `prefers-color-scheme` (no `data-theme`/`.dark` set in my test),
    so OS-dark emulation alone stayed light — a whole-app theme behavior, not a `/follow` bug.

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
