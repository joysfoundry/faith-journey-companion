---
description: Show release status of stories/commits (published to prod vs not, and where)
allowed-tools: Bash(scripts/published.sh:*), Bash(git fetch:*)
---

Run the release tracker and show the user its output.

1. `git fetch -q origin` (best-effort; ignore failure) so `origin/main` is current.
2. Run `scripts/published.sh $ARGUMENTS` from the repo root.
3. Show the output as-is. If the script says there's no `prod` tag, relay its
   instructions (the user must run `scripts/published.sh mark <sha>` at the last
   commit they Published in Lovable).

Notes for interpreting it: "Published" = live to users via Lovable PUBLISH (tracked
by the movable `prod` tag). Unpublished work is labeled by where it sits —
committed-local / on a remote branch / on main (staging). A story shows as flagged
only if its `.md` declares `visibility: flagged`. Pass extra args through
`$ARGUMENTS` (e.g. `--all`, or an `ACTS-NN` to focus one story).
