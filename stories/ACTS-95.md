---
id: ACTS-95
title: Pray a shared session in the app — adopt a /follow link into your sessions (+ sign in to save)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-94]
relates_to: [ACTS-94, ACTS-76, ACTS-82, ACTS-87, ACTS-88]
started_at: 2026-08-28T12:29:45-0700
updated:    2026-08-28T12:29:45-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone who **has the app** and receives a shared prayer link, I want to **pray it with
full functionality** — the ACTS-76 tracker (current step, tap-to-complete, grayed-out done,
auto-scroll), keep-awake, Finish — instead of only the read-only guest view; and I want the
**opportunity to sign in and have the shared session added to my sessions list** so it's mine
to pray (and re-pray) from the app.

Spun off from **ACTS-94** (guest, read-only, no app). This is the *app-user* counterpart:
adopt a shared session into the app.

## Acceptance criteria
- [ ] On a `/follow` link (fragment **and** `/follow/<slug>`), an app user sees an
      **"Pray this in the app"** action (guests keep the plain read-only view).
- [ ] **Adopt into the store:** turn the decoded `SharePayload` into a stored `PrayerSession`
      + its `SessionItem`s and navigate to `/session/<id>` — full Prayer Mode, tracking and
      all. Reuses ACTS-94's `decodeShare` + the already-compiled items (no re-compile needed).
- [ ] The adopted session appears in the user's **Sessions list** (Pray → Sessions).
- [ ] **Opportunity to sign in:** offer sign-in at adopt time; on sign-in, the shared session
      is saved to **their** sessions list. Un-signed-in adopt still works (saved locally).
- [ ] Sensible **de-dupe** — adopting the same link twice shouldn't silently pile up identical
      sessions (confirm the desired behavior with JC).
- [ ] Cover intention/welcome (`purpose`/`info`) carried onto the adopted session where it
      makes sense (or dropped — decide).

## Notes / design questions
- **"Has the app" detection:** this is a mobile web / PWA app (ACTS-90), no native app —
  "app user" ≈ using the main app / returning user / (later) signed in. Decide the signal
  (e.g. always offer "Open in the app"; it just deep-links into the running app).
- **Sign-in + "saved to my account"** depends on **auth (ACTS-87 / ACTS-88)** and
  **persistence (ACTS-82)** — same Supabase connection that ACTS-94 turned on
  ([[supabase-backend]]). The **local** adopt (into localStorage sessions) works **without**
  auth today; the "save to my account across devices" layer arrives with ACTS-82/87/88, so
  this story can ship the local adopt first and grow the signed-in path.
- **Not in scope:** live-sync ("everyone advances together") — still a future story.

## Tests
_Per ACTS-91 convention. No runner yet (harness = ACTS-92) → planned._
- **Unit** (Vitest): payload → `PrayerSession` + `SessionItem[]` adoption mapping; de-dupe rule.
- **Integration** (Testing Library): `/follow/<slug>` for an app user renders "Pray this in the
  app"; adopting navigates to Prayer Mode with a tracking-enabled session; guest sees read-only.
- **E2E** (Playwright — add to `docs/E2E-TEST-PLAN.md`): open shared link → "Pray in the app" →
  Prayer Mode with completion tracking → session shows in the Sessions list; sign-in variant.
