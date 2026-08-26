---
id: ACTS-90
title: Platform decision — mobile-first, mobile web (no app store)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-82, ACTS-87, ACTS-88]
started_at:
updated: 2026-08-25T21:47:01-0700
latest_handoff: null
sessions: 0
---

## Goal
As the owner, I want the delivery platform decided and written down so every later story
builds for the right target: **mobile-first, but delivered as mobile web (web-view first),
NOT the native app store.**

## Stated direction (JC, 2026-08-25)
- Mobile-first — yes.
- Delivered as **web / mobile web**, viewed in a browser.
- **Will not be released in the app store** (no native iOS/Android build) — at least first.

## To decide / capture
- [ ] **PWA vs plain responsive web** — installable (Add to Home Screen) + offline via
      service worker, or just a responsive site? (App already stores data in localStorage,
      which suits a PWA + offline-first.)
- [ ] Implications to document: offline behavior, "install" UX, no native APIs
      (camera/OCR — see ACTS-81), push notifications (limited on iOS web).
- [ ] How this interacts with auth/persistence (ACTS-82/87/88) — a public web app likely
      wants real accounts.
- [ ] Record the decision in the roadmap so it stops being an open question.

## Notes
Spun off from the ACTS-75 workflow chat. This is a **spike/decision** story — output is a
written decision + any small config (e.g. PWA manifest) if we commit to PWA.
