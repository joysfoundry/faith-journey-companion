---
id: ACTS-93
title: Explore — share a read-only "follow-along" prayer view for guests without the app
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-94, ACTS-90, ACTS-82, ACTS-76]
started_at: 2026-08-27T11:17:36-0700
updated:    2026-08-27T11:43:58-0700
latest_handoff: ACTS-93/session-01.md
sessions: 1
---

## Goal
As someone leading a group prayer session (e.g. the monthly family rosary), I want to
share a simple **read-only "follow-along" view** of the session's prayers so guests who
**don't have the app** can follow along on their own phones — no install, no account.

## Acceptance criteria
This is an **exploration/spike** — the deliverable is a recorded decision + a recommended
first implementation slice (filed as a follow-up story), not shipped UI.

- [x] **What the guest sees:** the compiled prayer view (ordered steps + text), read-only,
      no editing, renders well on a phone browser. → Confirmed feasible: see Findings.
- [x] **Cover message / header** is in scope: session **date**, **title**, **purpose**, and
      a short **info** blurb shown at the top of the shared view. → Fields already exist
      except `info` (new free-text field).
- [x] **How session data reaches the guest** (today = localStorage-only, no backend):
      evaluated (a) self-contained shareable URL, (b) backend-hosted link (ACTS-82),
      (c) static export / PDF. → **Decision: (a) URL fragment** for slice 1.
- [x] **Sharing mechanism:** shareable link + **QR code** for in-person hand-off.
      **Live-sync is OUT of scope** → later story. → Confirmed. QR is best-effort (capacity).
- [x] **Licensing:** prayers are **public domain** → no copyright blocker. Recorded.
- [x] **Output:** recommended first implementation slice filed as a follow-up story → **ACTS-94**.

## Findings (compile → render path)
- **The compiler already emits self-contained text.** `generatePrayerSession(db, template,
  ctx)` ([`src/lib/prayer/compiler.ts:402`](../src/lib/prayer/compiler.ts)) flattens the compact
  template (shorthand, mystery placeholders, song segments) into `{ session, items }` where
  each `SessionItem` ([`types.ts:418`](../src/lib/prayer/types.ts)) carries its own resolved
  `title` / `body` / `reference`. **Rendering needs zero DB lookups.** → Sharing only needs the
  compiled OUTPUT, not the whole database.
- **The running view already renders purely from `SessionItem[]`.**
  [`src/routes/session.$sessionId.tsx:117`](../src/routes/session.$sessionId.tsx) maps each item
  through a small `ItemView` (`:535`) taking only `item: SessionItem`. A guest view = same list,
  minus tap-to-complete and Finish.
- **Persistence is localStorage-only** — `STORAGE_KEY = "prayer-companion-db-v22"`, plain
  `JSON.stringify` ([`store.ts:47`](../src/lib/prayer/store.ts)). No backend → a hosted `/s/<id>`
  link is impossible until ACTS-82. Slice 1 must be self-contained.
- **Cover fields exist:** `session.context.date`, `session.title`, `plan.purpose` /
  `planTitle()` (`compiler.ts:92`). Only a free-text **`info`** blurb is new.

## Decisions (JC, 2026-08-27)
- **Delivery:** self-contained **URL fragment** (`/follow#<payload>`). Fragment stays
  client-side (never hits a server) → private + dodges server URL-length limits.
- **Step form:** **fully expanded** — every step written out 1:1 like the running view
  (not deduped/outline). _Consequence:_ a full rosary payload is ~20–40 KB raw; compresses
  fine for a tap-to-open link, but **exceeds QR capacity** for longer sessions → **QR is
  best-effort** (short sessions only); link-sharing is the reliable path.
- **Guest interaction:** **read-only, self-paced** — scroll at your own pace, no completion
  tracking, no shared state. Works offline once the link opens.
- **Live-sync ("advance together"):** OUT of scope → future story.
- **Licensing:** prayers are **public domain** → no blocker to sharing text.

## Payload prototype — measured (2026-08-27)
Reproduce: `npx tsx stories/ACTS-93/payload-probe.mts`. Method: compile a real seeded
session → keep only guest-rendered fields (`kind/title/body/reference/repetition_*/config`) +
cover → `JSON` → `deflate raw` (proxy for lz-string) → `base64url` = the URL fragment.

| Session | Steps | Raw JSON | Compressed | Fragment (chars) | QR? | Link? |
|---|--:|--:|--:|--:|:-:|:-:|
| The Holy Rosary (5 decades) | 79 | 25.8 KB | 2.4 KB | **3,146** | ✗ | ✓ |
| Caro Family Rosary | 91 | 31.4 KB | 3.9 KB | **5,156** | ✗ | ✓ |
| Scriptural Rosary (Luminous) | 129 | 27.3 KB | 3.3 KB | **4,430** | ✗ | ✓ |
| Chaplet of St Michael | 55 | 16.6 KB | 1.7 KB | **2,272** | ~ | ✓ |
| Litany of Humility | 24 | 2.6 KB | 0.5 KB | **658** | ✓ | ✓ |
| Pray with the Pope | 1 | 0.5 KB | 0.3 KB | **400** | ✓ | ✓ |

**Takeaways:**
- **Compression is decisive** — big sessions squeeze to ~9–12% of raw. A full rosary
  fragment is only ~3 KB.
- **Tap-to-open link works for everything** — even the largest (5.2 KB) is far under any
  modern browser's fragment limit (>64 KB). Slice 1 is viable with **no backend**.
- **QR is confirmed best-effort** — only short sessions (litanies, single prayers, ~borderline
  chaplets; fragment <~2 KB) fit a scannable code. A **full rosary does NOT fit a QR** →
  the reliable in-person hand-off is the **link** (or a URL shortener / hosted `/s/<id>`
  once ACTS-82 lands). This directly follows from the "fully expanded" step choice.

## Recommended slice 1 (→ ACTS-94)
Public no-auth route `/follow` that decodes a **compressed** (e.g. lz-string) compiled-session
payload from the URL **fragment** and renders: cover header (date / title / purpose / info) +
a read-only list reusing `ItemView`. Leader-side **Share** sheet with copyable link + QR
(best-effort). New `info` field on the session context. No backend.

## Notes / context
- **ACTS-90** recorded the platform direction: mobile-first, mobile web, no app store
  (PWA-leaning but parked). A shareable **URL** is the natural fit for a no-install guest.
- **ACTS-82** (Supabase persistence) is parked — until it lands there is **no server** to
  host shared state, which is why option (a) URL-encoded state is attractive for slice 1.
- **ACTS-76** built the pray-mode tracker (current item / grayed-out completed / auto-scroll)
  — the guest view is a read-only cousin of that pray view.

## Tests
_Exploration/spike — no code change expected in this story. Coverage is **N/A** until the
follow-up implementation story is filed; that story will document its own tests per the
ACTS-91 convention._
- **Unit** (Vitest): N/A — decision/spike, no `src/lib/**` change.
- **Integration** (Testing Library): N/A — no component change.
- **E2E** (Playwright): N/A now; the implementation follow-up will add a "guest opens
  shared link → sees read-only session" flow to [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md).
