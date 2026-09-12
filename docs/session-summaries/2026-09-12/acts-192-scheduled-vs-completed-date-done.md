# Session summary — 2026-09-12 — ACTS-192 scheduled-vs-completed date + seeded-daily consistency (Done)

Primary (and only) story: **ACTS-192** — built, iterated heavily with JC, shipped, closed Done.

## What happened (in order)
1. **Started ACTS-192** and **reproduced** the bug live (dev :8080): a future one-time session
   prayed early both **lingered as a start-able to-do** and (in the evening) **vanished from Done**.
   Root causes found: session records `context.date = today` (scheduled day lived only on the plan);
   Home's "done today" sliced **UTC** off `completed_at` while `today` is **local**.
2. **Core fix** — new optional `scheduled_date` on the session (from the plan's date, `context.date`
   left alone for mystery/liturgical selection); `dayOf` exported and reused so "done today" is by
   local day; `occurrenceDone(plan)` drops a finished occurrence from Upcoming; Home "Done" shows
   `Done · scheduled <day>` only when the two differ. Verified early-completion + a simulated
   8:55pm-Pacific completion. Commit `4452f53`.
3. **Home card rework** (JC feedback, multiple rounds): split Today (startable, top) from a
   **collapsed, non-startable "Upcoming this week"** banner; recurring plans show `N×` for the week;
   dropped the header plan-count that contradicted a daily's `N×`.
4. **Seeded-daily consistency** — JC: the Daily Rosary and Daily Open Prayer are both default daily
   sessions and should behave identically. Pinned the **Daily Open Prayer** as its own top row under
   the Daily Rosary (same blue "Daily …" header), out of Today/Upcoming/Done; "Upcoming this week"
   now holds only **user-scheduled** sessions. (Reverted an earlier wrong-direction change that had
   *hidden* a completed daily from Upcoming.) Commits `62fc941` (superseded), `57d0cbc`.
5. **Plan tab (`/pray`) made consistent** — Daily Open Prayer moved into the "Daily" section beside
   the Rosary, out of "Upcoming". Commit `5d804b9`.
6. **Upcoming collapsed by default** — made expansion session-only (dropped localStorage
   persistence) so it never returns expanded. Commit `0bcac04`.
7. **Closed ACTS-192 Done** — final handoff `stories/ACTS-192/session-01.md`; all four acceptance
   criteria met and verified.

## Commits (all on origin/main)
`4452f53`, `19e0f84` (pointer), `62fc941` (superseded), `57d0cbc`, `5d804b9`, `0bcac04`,
plus the /done docs. Pushes done by JC from their git client (sandbox can't auth to GitHub).

## Decisions worth remembering
- **`context.date` is NOT the scheduled date** — it's `today` at start and drives rosary-mystery/
  liturgical selection; the scheduled day is the new `scheduled_date`.
- **Rolling stays** for recurring plans (today done → Done, next → Upcoming); the bugs were the
  one-time-lingering, the evening UTC drop, and the lost scheduled date — not the roll.
- **Two seeded dailies are pinned, identical, everywhere** (Home + Plan tab); "Upcoming" = user
  scheduled sessions only; the Home Upcoming look-ahead is always collapsed on load.

## State at end
- Working tree clean; `main` == `origin/main` at `0bcac04`.
- ACTS-192 **Done** (`sync: local`). No pending syncs. Local-first + Lovable → reaches beta on next
  Publish.
- Open follow-ons untouched: ACTS-193, ACTS-197–200.
