---
id: ACTS-160
title: Serve the beta invitation from the app's own origin
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-158, ACTS-159, ACTS-82]
started_at: 2026-09-05T15:00:00-0700
updated:    2026-09-05T15:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone inviting friends and family to the beta, I want the invitation page to live on
Oravia's own domain, so that a recipient can read it without an account on a third-party
service and without leaving the app's identity.

## Context
ACTS-159 published the invitation as an artifact at
`claude.ai/code/artifact/0a832e6c-…`. That answered "make it HTML", but raised a question
it could not answer: **whether a recipient needs a Claude account to open it.** For this
audience — friends and family invited to a devotional beta — being asked to sign up for a
developer tool to read a one-page invitation is a hard stop, and a Claude-branded URL
alongside a prayer-app link reads oddly regardless.

Serving it ourselves removes the question rather than answering it.

**Why `public/` specifically:** files there are handed straight to the browser without
going through the router, so the page sits **outside** the client-side beta gate in
`src/components/beta-gate.tsx`. A recipient reads the invitation with no passcode, no name
prompt and no account, then taps through to the app — where the gate does its job.

## Acceptance criteria
- [x] Page served from the app's own origin at **`/invite.html`**.
- [x] Reachable with **no passcode and no name prompt** — verified the response carries no
      app bundle and no gate markup.
- [x] Standalone document (doctype/`<head>`/`<body>`), since the artifact wrapper that
      previously supplied those is gone.
- [x] Carries its own Open Graph + Twitter tags, so sharing **this** link shows the
      ACTS-158 card rather than falling back to a page screenshot.
- [x] Single source — moved with `git mv`, not copied, so there is no second version to
      drift (the failure mode ACTS-159 existed to fix).

## Decisions
- **`/invite.html`, not `/about.html`.** The app already has an in-app `/about` route
  behind the gate; two things called "about" at one origin, one gated and one not, invites
  confusion. This page is the invitation.
- **The `.html` extension stays.** A bare `/invite` would need a route or server rewrite,
  which would pull the page back inside the app it is deliberately outside of.
- **The artifact is superseded, not deleted.** It stays private and harmless as a preview
  copy. Note its file path moved, so republishing from this repo now targets a new
  artifact — the old URL will not update itself.

## Tests
- **Unit / Integration:** N/A — a static asset with no application code.
- **E2E** (Playwright): N/A until the ACTS-92 harness exists. Verified by fetching the
  served response (status, content-type, absence of the app bundle and gate markup) and
  by rendering the page at 375×812.
