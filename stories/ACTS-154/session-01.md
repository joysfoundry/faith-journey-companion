---
story: ACTS-154
session: 01
wrapped_at: 2026-09-04T21:04:05-0700
status: Done
final: true
---

## What happened
Moved **Online Bible** out of the Daily Readings block and onto the Word section header,
on both surfaces. Shipped in `35d8faa`.

**The structural catch.** The story assumed one edit would fix both surfaces, since
`WordSection` is shared. It doesn't: the header `actions` slot lives in the *callers*, not
in `WordSection`. Home builds it in [`index.tsx`](../../src/routes/index.tsx) via
`SectionCard actions=`, while `/word` wraps the same component in `AppShell` from
[`PageShell.tsx`](../../src/components/layout/PageShell.tsx). Only the *removal* is shared;
the placement had to be done per surface. JC chose **option 1** — header on Home, promoted
on `/word` — over changing the shared layout.

⚠️ I first reported that `/word`'s shell had no actions slot. **That was wrong** — I'd
looked at `word.tsx` (which passed none) rather than the component. `PageShell`'s
`AppShell` has had an `action` prop all along, already used by five pages
(`prayers`, `devotion.$devotionId`, `voice.$voiceId`, `knowledge.$knowledgeId`, `pray`).
That made option 1 strictly cheaper than described: **no layout change, no prop threading.**

**Shape.** One exported `OnlineBibleLink` in `WordSection.tsx` that calls `useApp()` and
`resolveBibleHomeUrl` itself and returns `null` on `""`, so the omit-when-unset rule has
exactly one home and both callers just drop it into their slot.

## Verified (and how)
Browser, dev server, **four states**:

| State | Home | `/word` |
| --- | --- | --- |
| Bible set (YouVersion) | link in header | link in header |
| "I don't use one yet" (`resolveBibleHomeUrl` → `""`) | absent | absent |

- Rendered anchor resolves to `https://www.bible.com/` with `target="_blank"` and
  `rel="noopener noreferrer"`; **exactly one** such link per page — nothing stranded in
  the body.
- **Mobile 375px:** neither header wraps or crowds.
- No second `BookOpen` — `WordSection` no longer imports it at all.
- `tsc --noEmit` clean; `eslint` clean on the three touched files (Prettier reflowed the
  shortened lucide import); `verify-liturgical` 19/19.

**All acceptance criteria met.**

## Notes for later
- Getting past the beta gate needed a temporary `.env.local` with an empty passcode;
  **deleted after** — it is not in the tree or in history.
- The Browser pane's dev-server port and Vite's actual port disagreed (pane said 64715,
  Vite bound 8081); navigate to the port in `preview_logs`, not the one in the tool result.

## Side-issues found (not folded in)
- **`verify-merge.ts` was crashing on a dead API** — pre-existing, confirmed against
  stashed HEAD. Filed and fixed as **ACTS-155** (`0c38494`), still In Progress.
- **`.env` is tracked and not gitignored** — holds `VITE_SUPABASE_*` and
  `VITE_BETA_PASSCODE`. A `.gitignore` entry was added this session, but the file stays
  **tracked** (see the ACTS-154 close report); untracking risks the Lovable/CI build,
  which has no `.env.example` to fall back on.

## Git state at handoff
**Committed, NOT pushed.** `35d8faa` (code) + `69d80bf` (this close-out).
`git push` fails in this environment — `could not read Username for 'https://github.com'`;
no `gh`, no SSH key, and the osxkeychain helper can't be read non-interactively. Same
blocker ACTS-153 hit. **Four commits are waiting on `origin/main`:**

    35d8faa  ACTS-154: move the Online Bible link onto the Word header
    0c38494  ACTS-155: repair the stale verify-merge.ts harness script
    eb094a0  chore: gitignore .env (entry only — file stays tracked)
    69d80bf  docs: close ACTS-154 (Done) + file ACTS-155 (harness repair)

Run `git push origin main` from a terminal that has credentials.

## Next
None — story closed.
