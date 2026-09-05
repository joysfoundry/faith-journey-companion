---
story: ACTS-160
session: 01
wrapped_at: 2026-09-05T16:10:00-0700
status: Done
final: true
---

## What happened
Filed and closed in one session, as the follow-on to ACTS-159.

ACTS-159 published the beta invitation as a Claude artifact. That answered "make it
HTML" but raised a question it could not answer: **does a recipient need a Claude account
to open it?** For friends and family invited to a devotional beta that is a hard stop, and
a Claude-branded URL beside a prayer-app link reads oddly either way. Serving it ourselves
removed the question instead of answering it.

    docs/brand/oravia-about.html  ->  public/invite.html
    myoravia.lovable.app/invite.html

**Why `public/`:** files there are handed straight to the browser without passing through
the router, so the page sits **outside** the client-side beta gate in
`src/components/beta-gate.tsx`. A recipient reads the invitation with no passcode, no name
prompt and no account, then taps through — where the gate still does its job.

Three things the move required:
- **A standalone document.** The artifact host had been supplying the doctype, `<head>`
  and `<body>`; served directly, the page brings its own.
- **Its own OG/Twitter tags.** Without them, sharing *this* link would have fallen
  straight back into the ACTS-158 bug — a scraper finding no image and screenshotting the
  page.
- **`git mv`, not a copy.** One source, no second version to drift — the failure ACTS-159
  existed to fix.

## Verified (and how)
Locally, against the served response:
- `/invite.html` → 200, `text/html`, **no app bundle and no gate markup** in the body —
  the check that matters, since the whole point is bypassing the gate.
- Rendered at 375×812 after the rewrap, confirming it still holds up without the
  artifact's CSS reset.
- `tsc` + `vite build` clean.

**Live confirmation is JC's, not this session's.** Browser navigation to external domains
is blocked in the Claude Code environment, so `myoravia.lovable.app/invite.html` could not
be loaded from here. JC closed the story on their own check.

## Git state at handoff
Committed and pushed before this close (`a94fdbf`, `e6fc13f` after the rebase onto
Lovable's concurrent commits). Tree clean.

## Next
None — story closed.

**Related, deliberately not folded in:** the invitation says "no account needed" while
**ACTS-161** (stand down the passcode gate) is still To Do. JC's call 2026-09-05: the
published state is fine as it stands, and the gate comes down soon.
