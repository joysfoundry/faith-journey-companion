---
id: ACTS-161
title: Stand down the private-beta passcode gate
spine:
status: Done
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-82, ACTS-153, ACTS-158, ACTS-160]
started_at: 2026-09-05T13:15:11-0700
updated:    2026-09-05T15:16:41-0700
latest_handoff: ACTS-161/session-01.md
sessions: 1
---

## Goal
As someone handing the beta link to friends and family, I want them to open the app and
start praying without first being asked for a code, so that the invitation is the only
thing they have to act on.

## Context
`src/components/beta-gate.tsx` runs three steps in order:

1. **Passcode** — a shared access code, armed only when `VITE_BETA_PASSCODE` is set.
2. **Name** — "What should we call you?", stored in `settings.display_name`.
3. **Onboarding** — the two first-launch questions (ACTS-153).

Only step 1 is the *gate* in the exclusionary sense, and it is already conditional: the
component reads the code at build time and, when the value is empty, **skips the step
entirely** ("if it's unset the passcode step is skipped"). So standing it down is a
configuration change, not a rewrite.

It was never a security control — being `VITE_`-prefixed it ships inside the client
bundle, where anyone can read it. It kept search engines and passers-by out of a private
preview. That job is now mostly done elsewhere: the invitation lives at
`public/invite.html` (ACTS-160), outside the router and outside the gate, so the page a
recipient actually reads was never gated anyway.

Side effect worth having: ACTS-158 found that Apple, with no `og:image` to use, was
screenshotting **the gate's own name prompt** into the iMessage preview. The card fixed
that; one less gate is one less thing for a scraper to catch.

## Scope — what comes down, what stays
- **Down:** step 1, the passcode.
- **Stays:** step 2 (name) and step 3 (onboarding). They personalize and configure; they
  do not keep anyone out, and ACTS-153 deliberately asks everyone once.
- [ ] JC: flip this box if the **name prompt** should come down too — that is a real
      change (`display_name` seeds greetings and the export header), not a config flag.

## Two ways to do it — pick one at start
- **A — Unarm it (recommended).** Clear `VITE_BETA_PASSCODE` in the Lovable env and
  redeploy. Zero code, reversible in one field, and the conditional it relies on is
  already tested by every local run (the `.env.example` comment tells you to leave it
  empty locally, so *unarmed is the path we develop against every day*).
- **B — Delete the step.** Remove the passcode branch, `UNLOCK_KEY`, the env var and its
  `.env.example` block. Smaller component, but re-arming later means writing it again —
  and "for now" in the ask says this is a pause, not a decision.

**Recommendation: A.** Keep the code, drop the config. Revisit when real accounts land
(ACTS-82/87/88), which is what replaces this properly.

## Decisions — JC, 2026-09-05 (session 01)
- **Route: A now, B later.** Unarm the gate today by clearing `VITE_BETA_PASSCODE` in
  Lovable; the passcode code itself comes out for real as part of **ACTS-82/87/88**, which
  is what replaces the gate properly. So this story ships a *stood-down* gate, not a
  deleted one — and the pointer note below is what stops that becoming permanent by
  accident.
- **Name prompt stays** (step 2 unchanged). It personalizes greetings and the export
  header, it is one field, and it turns nobody away. The `[ ]` scope checkbox above is
  hereby answered **no**.

## Follow-through this story owns
- **`.env` still carries the test code `acts2026` locally** (untracked). Standing down
  production does **not** change local behaviour — anyone running the dev server keeps
  seeing the code field until they clear their own `.env`. Say so in `.env.example`.
- **The tester reset guide** (private artifact
  <https://claude.ai/code/artifact/6fb6c7b1-1bb8-47fd-8885-322a8f1b5004>) tells testers a
  full browser-data reset will re-ask for the code. Once unarmed that sentence is wrong —
  harmlessly so, but it is the only tester-facing document that mentions the code, so
  check it before sending the guide again.
- **Settings → "Start over"** deliberately keeps the unlock flag so a resetting tester
  stays inside the beta. With the gate unarmed that behaviour is moot, not broken — leave
  it alone; it is what makes route B reversible.
- Nothing tester-facing publishes the passcode: `public/invite.html` and
  `docs/brand/README.md` mention the gate only in comments explaining why the invitation
  sits outside it. Verified 2026-09-05.

## Acceptance criteria
_All verified **locally** on 2026-09-05 against a dev server run with `VITE_BETA_PASSCODE`
blanked (`.env` restored byte-identical afterwards — md5 `ad58d06`), storage cleared before
each run. The deployed host is JC's step and is the one box still open._
- [x] A visitor with no code lands on the app itself — first screen is the **name prompt**,
      no "Access code" field anywhere in the tree.
      **[ ] still to confirm on the deployed host** once Lovable's env is cleared.
- [x] Someone who unlocked earlier is unaffected. Stronger than expected: with the gate
      unarmed `acts-beta-unlocked-v1` is **never written and never read** — after a full
      first run localStorage held only `prayer-companion-db-v39`. A stale flag on a
      tester's browser is inert, nothing to clean up.
- [x] Name prompt and onboarding still run in order for a fresh browser — Tester → Bible
      app (YouVersion + NABRE) → daily rosary → Today, with `display_name` and
      `onboarding_completed_at` both stamped.
- [x] `/follow/*` guest links still bypass everything (ACTS-94) — a cleared browser at
      `/follow/<bogus>` gets the share view's "This link isn't available", **not** the
      name prompt. The exemption never depended on the gate being armed.
- [x] The invitation page still serves ungated at `/invite.html`.
- [x] Route (A): `.env.example` keeps its block, with a line noting the gate is **stood
      down in production as of this story** so the next person doesn't read the empty
      value as an accident.
- [x] **Re-arming works** — not in the original list, but it is the claim the whole route
      rests on, so it was tested: restoring the value and restarting brought the code
      field straight back. One env field, both directions.

## Noticed while verifying
**The armed gate costs a blank frame.** `BetaGate` holds on `<Splash />` while
`passcodeArmed && !checkedStorage`, so an armed first load paints blank until localStorage
is read. Unarmed, that condition is false and the hold disappears. Small, but it means
standing down makes first paint *faster*, not just shorter — worth remembering if the
gate ever comes back.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): N/A — the change is a build-time env value; there
  is no pure function to exercise.
- **Integration** (Testing Library — component + store): `BetaGate` with the passcode
  unset renders children/name-prompt without ever showing the code field; with it set,
  still gates. Two cases, one component — worth having whichever route is chosen, since
  it is the assertion that route A actually rests on.
- **E2E** (Playwright — see the plan): first-run flow (E-series entry), fresh profile →
  no code field → name → onboarding → Today. Planned until the ACTS-92 harness exists.
