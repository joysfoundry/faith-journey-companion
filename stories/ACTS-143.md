---
id: ACTS-143
title: About the app — menu entry (vision, beta purpose, "everything is local")
spine:
status: In Progress
origin: human-typed
depends_on: []
relates_to: [ACTS-90, ACTS-82]
started_at: 2026-09-03T23:42:36-0700
updated:    2026-09-04T08:21:53-0700
latest_handoff: null
sessions: 0
---

## Goal
As a beta tester, I want an **About** entry in the menu that explains what the app is,
the vision behind it, why this is a beta, and that **all my data stays on my device**, so
I understand what I'm using and can trust it with my prayer life before any account/cloud
step exists.

## Why
There's no in-app explanation of the app or its privacy model today. Testers land in the
gate ("Private beta · no email or account needed · your entries stay in this browser") and
then straight into the product with no vision/context. The local-only reality (localStorage
`STORAGE_KEY` — no backend yet; Supabase persistence is parked at ACTS-82) is a *feature*
worth stating plainly, especially for a prayer/journaling app.

## Design — to weigh
- **Placement.** Add an `About` link to `secondaryNavLinks`
  ([`nav-links.ts`](../src/components/layout/nav-links.ts)) so it shows in the desktop side
  rail + mobile drawer (below Settings). Pick an icon (e.g. `Info` / `Sparkles`).
- **Surface.** New `/about` route (matches the app's route-per-page pattern), OR a dialog.
  A route is simpler to link to and to expand later. TBD with JC.
- **Content** (JC to finalize the copy):
  - **What it is** — a calm companion for daily prayer, devotions, and reflection.
  - **Vision** — one short paragraph (draw from [`docs/ACTS-PRD.md`](../docs/ACTS-PRD.md)
    front matter: Mission / Problem / Solution).
  - **Why a beta** — early, evolving, feedback welcome; things may change/break.
  - **Everything is local** — entries live in this browser on this device; no email, no
    account, no server (yet). Clearing site data / "Start over" (Settings) erases them.
    Note the implication: not synced across devices/browsers today.
- Keep it short and warm; not a legal page. Link to Settings "Start over" from here.

## Open questions (flag before building)
- Route vs. dialog for the About surface.
- Final copy for vision + beta note (JC owns wording; may tie to the pending Oravia rebrand
  — see ACTS-144 — so avoid hard-coding the name in a way that's painful to change).
- Does "everything is local" messaging need a caveat once ACTS-82 (Supabase) lands?

## Acceptance criteria
- [ ] An **About** entry appears in the menu (side rail + mobile drawer).
- [ ] It opens a surface describing: what the app is, the vision, why it's a beta, and that
      all data stays local on the device (no account/server today).
- [ ] Copy is warm, brief, and accurate to the current (local-only) reality.
- [ ] Reachable on mobile and desktop; matches the app's visual style.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): N/A (static content) unless copy is data-driven.
- **Integration** (Testing Library): About link renders in the nav; activating it shows the
  About content (route or dialog).
- **E2E** (Playwright): open menu → About → the local-only + vision copy is visible on
  mobile and desktop widths.
