---
id: ACTS-161
title: Stand down the private-beta passcode gate
spine:
status: To Do
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-82, ACTS-153, ACTS-158, ACTS-160]
started_at: 2026-09-05T13:15:11-0700
updated:    2026-09-05T13:15:11-0700
latest_handoff: null
sessions: 0
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

## Acceptance criteria
- [ ] A visitor with no code lands on the app itself — verified on the deployed host in a
      browser that has never unlocked (private window, `acts-beta-unlocked-v1` absent).
- [ ] Someone who unlocked earlier is unaffected — the stale `acts-beta-unlocked-v1` flag
      is simply never read while the gate is unarmed; nothing to clean up.
- [ ] Name prompt and onboarding still run in order for a fresh browser.
- [ ] `/follow/*` guest links still bypass everything (ACTS-94) — unchanged, but confirm
      the exemption did not depend on the gate being armed.
- [ ] The invitation page still serves ungated at `/invite.html`.
- [ ] Route (A): `.env.example` keeps its block, with a line noting the gate is **stood
      down in production as of this story** so the next person doesn't read the empty
      value as an accident.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): N/A — the change is a build-time env value; there
  is no pure function to exercise.
- **Integration** (Testing Library — component + store): `BetaGate` with the passcode
  unset renders children/name-prompt without ever showing the code field; with it set,
  still gates. Two cases, one component — worth having whichever route is chosen, since
  it is the assertion that route A actually rests on.
- **E2E** (Playwright — see the plan): first-run flow (E-series entry), fresh profile →
  no code field → name → onboarding → Today. Planned until the ACTS-92 harness exists.
