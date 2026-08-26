---
id: ACTS-90
title: Platform decision — mobile-first, mobile web (no app store)
spine:
status: Done            # decision recorded (not a build story)
type: decision
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-82, ACTS-87, ACTS-88]
updated: 2026-08-25T21:47:01-0700
latest_handoff: null
sessions: 0
---

## Recorded decision (JC, 2026-08-25)
This is a **recorded decision**, not a story to build.

- **Mobile-first** — yes.
- Delivered as **mobile web (web-view first)**, viewed in a browser.
- **Not released in the app store** — no native iOS/Android build.
- **Leaning PWA** (installable / offline) rather than plain responsive web — but **not
  committed yet: parked, revisit later.** Do not build PWA plumbing until JC confirms.

## Parked sub-question
- **PWA vs plain responsive web** — deferred. When revisited, weigh installable +
  offline (service worker; suits the current localStorage/offline-first model) vs. a
  plain responsive site, and note implications: "install" UX, no native APIs
  (camera/OCR — ACTS-81), limited iOS web push. Ties into auth/persistence
  (ACTS-82/87/88).

_Collapsed from a spike story to a recorded decision on 2026-08-25 (ACTS-75 session)._
