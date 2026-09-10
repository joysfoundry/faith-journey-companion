---
id: ACTS-162
title: Send feedback from the menu
spine:
status: In Progress
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-94, ACTS-161, ACTS-157, ACTS-82]
started_at: 2026-09-05T13:15:11-0700
updated:    2026-09-05T15:56:40-0700
latest_handoff: null
sessions: 0
---

## Goal
As a beta tester who has just hit something confusing or broken, I want to say so from
inside the app while it is still in front of me, so that the report reaches JC without a
context switch into email — and so that JC hears from testers who would never have
written one.

## Context
Feedback is the whole point of the beta, and right now the only channel is "text JC".
That loses everything a tester notices but doesn't consider worth a message.

**This app is local-first.** Everything a person creates lives in localStorage; Supabase
is reached by exactly two deliberate paths today (creating a share link, fetching an
import). Feedback would be a **third** — user-initiated, explicit, and the first one that
sends anything the person *wrote about themselves*. That is fine, and it is exactly why
the UI has to say so plainly rather than quietly POSTing.

## Channel — table, following the hardened share pattern
JC's read ("probably table or combo") is right, and the reason is concrete: a browser
cannot send mail or hit a Slack webhook without a secret, and any secret in this app
ships in the bundle (the same reason the beta passcode was never a security control).
A table is the only option that keeps the credential server-side.

**Do it exactly like ACTS-94 after its lockdown**, which is the settled pattern here:

- Migration `supabase/migrations/0003_feedback.sql` — `public.feedback`, RLS **enabled
  with no policies**, `revoke all ... from anon, authenticated`, `grant all to
  service_role`. Not reachable from the browser at all.
- `src/lib/prayer/feedback.functions.ts` — a `createServerFn({ method: "POST" })` with a
  zod validator and a hard length cap, mirroring `share.functions.ts`.
- Columns: `id` (uuid pk), `created_at`, `message` (required, capped), `kind`
  (`bug | idea | other`), plus optional context — `display_name`, `route`, `device`.
  Nothing else: **no journey content, no reflections, no session data.** The Markdown
  export (ACTS-157) is the deliberate path for those, and it stays separate.
- **The visible-fields rule (decided 2026-09-05):** nothing goes in the row that the
  person cannot see on screen before they press send. Context is *prefilled and shown*,
  not silently attached — `route` renders as a removable line, `display_name` prefills
  from settings and can be cleared (anonymous must stay possible), and `device` is plain
  words ("iPhone · Safari") the person can read, **not a raw `user_agent` string**.
  A hidden fingerprint is the ambient collection that "no account, no email" repudiates;
  a field they can see is just a prefilled form. This is the line that keeps feedback
  consistent with the promise — the database was never the problem.
- `user_id uuid references auth.users(id) on delete set null`, null today. Lets auth
  (ACTS-87/88) start populating rows without reshaping the table or its access model.
- Insert-only. No client read path, so no one can enumerate other people's feedback.

**"Combo" is a follow-on, not this story.** Once rows exist, a Supabase DB webhook or
Edge Function can fan each new row out to email or Slack so JC gets a ping instead of
having to look. File it separately — the table is what makes the notification possible,
and shipping the table first means no feedback is lost while the relay is figured out.

⚠️ **Local dev:** like share links, this needs `SUPABASE_SERVICE_ROLE_KEY`. Without it the
server function throws "Missing Supabase environment variable(s)" — make the form surface
that as a plain failure message rather than a silent success.

## Placement
A `{ to: "/feedback", label: "Send feedback", icon: MessageSquarePlus }` entry in
`secondaryNavLinks` (`src/components/layout/nav-links.ts`) — the same list that carries
Settings and About, so it appears in the desktop side rail and the mobile drawer at once.
A route rather than a dialog: it matches every other menu destination, and it can be
linked to directly from the invitation or a nudge later.

## Acceptance criteria
- [ ] "Send feedback" appears in the menu on both mobile drawer and desktop rail.
- [ ] The form takes a message plus a kind (bug / idea / other); message is the only
      required field.
- [ ] One line, visible before sending, saying what leaves the device — and that it does
      **not** include prayers, reflections or journey entries.
- [ ] A successful send confirms in place and clears the field; a failed one says so and
      **keeps what they typed**.
- [ ] Row lands in `public.feedback` with the message, kind, timestamp, and the route the
      person was on.
- [ ] The table is unreachable from the browser — verified by attempting a client-side
      select/insert with the publishable key and getting denied.
- [ ] Works with no name set (i.e. after ACTS-161, `display_name` may be absent).
- [ ] Length cap enforced server-side, not only in the textarea.
- [ ] **Every field that lands in the row is visible in the form before sending** —
      `route`, `display_name` and `device` are shown, and each can be removed/cleared.
- [ ] No raw `user_agent`, no IP, no silent identifier is stored.
- [ ] Feedback can be sent anonymously (name cleared) and still succeeds.
- [ ] The About copy naming feedback as a thing that leaves the device is accurate —
      i.e. this ships, or the word comes back out of `about.tsx` **and** `invite.html`.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): the zod input validator — empty message rejected,
  over-cap message rejected, unknown `kind` rejected, valid payload passes.
- **Integration** (Testing Library — component + store): the form renders, submit is
  disabled while empty, a mocked failure keeps the draft text on screen, a mocked success
  clears it and shows the confirmation.
- **E2E** (Playwright — see the plan): new flow — open menu → Send feedback → type →
  submit → confirmation. Add it to `docs/E2E-TEST-PLAN.md`; planned until ACTS-92.
