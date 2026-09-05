---
story: ACTS-164
session: 01
wrapped_at: 2026-09-05T15:50:54-0700
status: Done
final: true
---

## What happened

JC asked for "a small tweak to about html": say plainly that you can build a devotion
**as you have learned to pray it** — without flipping through booklets and papers — and
**share it** so others pray alongside you, so someone still learning is not lost and can
stay focused on the prayer.

⚠️ **The premise needed widening before the edit: this copy lives in two mirrored
surfaces, not one.** `src/routes/about.tsx` (the in-app About page, ACTS-143) and
`public/invite.html` (the public invitation served outside the gate, ACTS-160) both
carry a "One place for your journey" section with near-identical prose. Editing only one
would have re-created exactly the drift ACTS-159 existed to fix. Both were changed in the
same commit.

The new paragraph, added between the scattered-places paragraph and the "hub, not a
walled garden" one:

> Build a devotion once, the way you have learned to pray it, and it's there every time —
> no flipping between a booklet, a holy card, and a printout. Share it and others pray it
> right alongside you; anyone still learning has the words in front of them, in order, so
> they can stay in the prayer instead of wondering what comes next.

**Two judgment calls, both flagged to JC and accepted:**

1. **A redundant clause was removed, not left to sit beside the new one.** The paragraph
   above already ended "…a way to sing, **and a follow link so others can pray along** —
   so the tool disappears and the prayer stays" — the same promise, buried mid-list where
   nobody reads it. That is *why* the story existed, so the clause came out rather than
   saying it twice in consecutive paragraphs. That sentence now ends "…reflection as a
   first-class step, and a way to sing — so the tool disappears and the prayer stays."
2. **The two surfaces get different contractions on purpose.** `invite.html` avoids
   contractions throughout ("It is a hub", "there is no account", "they do not sync"), so
   it reads "and it **is** there every time"; the in-app page uses them, so it keeps
   "it&rsquo;s". Same sentence, each in its own voice. Anyone re-syncing these two files
   later should not "fix" that into a diff.

No new section heading — JC asked for tight, and it is two sentences inside a section
that was already about this.

## Verified (and how)

- **Rendered both pages in a real browser at 375×812**, which mattered more than usual
  here: `/about` is **client-rendered**, so `curl` returns a 4 KB shell with none of the
  copy in it. A first pass that grepped the SSR HTML found nothing and proved nothing.
- ⚠️ **The preview harness could not reach the dev server**: `.claude/launch.json` pins
  `port: 8080`, a **stale vite dev server from an earlier session already held 8080**, so
  vite fell back to 8081 while the preview proxy kept pointing at its own assigned port.
  Two `preview_start` attempts opened a tab that could not navigate. Resolved by leaving
  the stale server alone (it serves this same project, HMR and all) and opening it
  directly with `preview_start {url: "http://localhost:8080/about"}`. Worth knowing before
  debugging the same dead tab again.
- The local beta gate was armed (`VITE_BETA_PASSCODE` is set in `.env`), so the page was
  reached by setting the unlock key `acts-beta-unlocked-v1` in localStorage rather than
  typing the passcode.
- `/about`: full page text read back — the paragraph sits in the right place, and the
  trimmed clause is confirmed **gone** ("follow link so others" returns nothing).
- `/invite.html`: paragraph found and screenshotted in place at phone width.
- `tsc --noEmit` clean; `vite build` clean.
- ⚠️ **Prettier warns on both files — pre-existing.** Confirmed by stashing the change and
  re-running `prettier --check` on a clean tree: both files already failed. Left untouched
  (ACTS-155 precedent: do not reformat code the story did not touch).

## Git state at handoff

Committed **and pushed** — `d5da07d` (copy) + `3bead83` (story docs), plus this handoff.
⚠️ `git push` **failed from this session** (`could not read Username for
'https://github.com': Device not configured` — no credentials in this environment); JC
pushed from their own git client. Expect the same failure on the next `/save` here.

## Next

Story closed — all acceptance criteria met. Nothing outstanding.

**For whoever edits this copy next:** `about.tsx` and `invite.html` are mirrors and must
be changed together. A future story could collapse them onto one source, but they are
deliberately different documents today — one is a gated React route, the other a
standalone static file with its own OG tags — so a shared source is a real refactor, not a
tidy-up. Related: the ACTS-147 PRD resync still owes a pass folding the About framing into
`docs/ACTS-PRD.md`, and this paragraph is now part of that framing.
