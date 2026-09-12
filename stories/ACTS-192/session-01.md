---
story: ACTS-192
session: 01
wrapped_at: 2026-09-12T13:20:00-0700
status: Done
final: true
---

## What happened
Fixed the "a session prayed off its scheduled day misbehaves on Home" bug, then — through
several rounds of JC feedback — reworked how the two seeded daily prayers (Daily Rosary +
Daily Open Prayer) present across Home and the Plan tab so they behave identically.

**Core date fix (the original bug):**
- **`scheduled_date` on the session** (`types.ts`, `store.ts` `startBuiltSession`) — a
  plan-started session now records the plan's scheduled day, kept distinct from
  `completed_at`. `context.date` is left untouched (it drives rosary-mystery/liturgical
  selection, so repurposing it would silently change which mysteries a pre-scheduled rosary
  shows). The plan's own `date` is never overwritten.
- **Evening "disappears" fixed** — Home's "done today" was slicing the **UTC** string off
  `completed_at` while `today` is the **local** day, so an evening-Pacific completion rolled
  to tomorrow and vanished from Done. Now compares by local day via the exported `dayOf`
  helper (`journeyExport.ts`).
- **Finished one-time session no longer lingers** as a start-able to-do — generalized the
  upcoming suppression to `occurrenceDone(plan)` (a once-plan with any completion is done;
  a recurring plan's occurrence is done when a completed session records that `plan.date`).
- **Both dates shown, collapsed when equal** — Home "Done" rows read `Done · scheduled <day>`
  only when the completion day differs from the scheduled day.

**Presentation rework (JC-driven, this session):**
- **Home "Upcoming this week"** — split today's sessions (startable, top) from later-this-week
  (a **collapsed, non-startable** look-ahead under a distinct gray banner). Recurring
  user-scheduled plans show an `N×` count for the week (total occurrences). Header is just
  "Upcoming this week" (dropped the plan-count that contradicted a daily's `N×`).
- **Two seeded dailies pinned together** — the Daily Open Prayer (`plan-daily-open-prayer`)
  now sits as its own pinned top row directly under the Daily Rosary with the same blue
  "Daily …" header, and is kept OUT of Today/Upcoming/Done. Both dailies behave identically;
  "Upcoming this week" holds only **user-scheduled** sessions.
- **Plan tab (`/pray`) made consistent** — the Daily Open Prayer moved into the "Daily"
  section beside the Daily Rosary (matching badge) and out of "Upcoming".
- **Upcoming always starts collapsed** on Home — expansion is session-only (dropped the
  localStorage persistence) so it never returns expanded on a later visit.

## Acceptance criteria — all met
- [x] Completed-off-schedule session stays visible/placed on Home; doesn't vanish, doesn't
      re-appear as a start-able to-do once done.
- [x] Completed sessions show both dates where listed (Home Done), collapsed to one when
      scheduled == completed day.
- [x] The scheduled date on the plan/record is never overwritten by the completion date.
- [x] Date formatting avoids the yyyy-mm-dd UTC-midnight off-by-one (reuses `dayOf` /
      local-midnight parsing).

## Verified (and how)
- **In-app (dev :8080):** built a future one-time session (Sep 15), prayed it early (Sep 12) →
  appears **once** under `Done · scheduled Tue, Sep 15`, no lingering upcoming row.
- **Evening off-by-one:** set a completion to 03:55Z (8:55pm Pacific) → still shows in Done
  after the fix (was dropped before). Also confirmed in-page: local day Sep 12 vs UTC slice
  Sep 13.
- **Dailies:** Home shows Daily Rosary + Daily Open Prayer pinned with matching headers,
  both out of Upcoming; Plan tab shows both under "Daily", Upcoming holds only the
  user-scheduled Novena. JC confirmed the aligned headers.
- **Collapsed default:** Home loaded with "Upcoming this week" collapsed even though the
  browser had it previously expanded.
- `npx tsc --noEmit` clean throughout.

## Git state at handoff
- All ACTS-192 code + docs **committed and on `origin/main`** (local matches the remote ref,
  0 ahead / 0 behind). This session's commits: `4452f53` (date/placement/evening + collapsible
  Upcoming), `19e0f84` (pointer → In Progress), `62fc941` (superseded), `57d0cbc` (pin Daily
  Open Prayer, Home), `5d804b9` (Plan tab consistency), `0bcac04` (Upcoming collapsed by
  default). Pushes were done by JC from their git client (the sandbox can't auth to GitHub).
- Local-first + Lovable: reaches the beta on the next Publish.

## Gotchas / notes for future work
- **`context.date` ≠ scheduled date** — it's stamped `today` at start and feeds mystery/
  liturgical selection; the scheduled day lives in the new `scheduled_date`. Don't conflate.
- **Running store clobbers direct localStorage edits** — set up clean test data via the UI or
  edit + reload before the store re-serializes (bit me repeatedly this session).
- **The two seeded dailies are structurally different**: the Daily Rosary is a settings-driven
  virtual row (not a `session_plan`); the Daily Open Prayer is `plan-daily-open-prayer`. Both
  are now special-cased into a pinned top row on Home and the "Daily" section on the Plan tab.
- Follow-ons still open from ACTS-191/196: ACTS-193 (Journal "Source" grouping), ACTS-197–200.
