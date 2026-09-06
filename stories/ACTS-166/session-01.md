---
story: ACTS-166
session: 01
wrapped_at: 2026-09-05T17:22:32-0700
status: Done
final: true
---

## What happened

JC reported the switch icon on the Home Daily Rosary row doing nothing: the "Daily
devotion" picker opens, a devotion is chosen, and the row stays on Hallow.

**The cause was a precedence bug, not a broken write.** `src/routes/index.tsx:345` decides
the whole row from `daily_rosary_mode`:

```
const externalDaily = !dailyFulfiller && isExternalDailyRosary(db.settings);
```

When that is `"external"`, the subtitle is `Opens in ${dailyAppLabel}` and the action is
the external link. The picker's `onChoose` was `setDailyTemplate` — it wrote
`daily_template_id` faithfully, but while external mode was on **no part of that row read
it**. Settings avoids the same trap only because it hides the devotion select entirely
while external.

JC's opening suggestion was to make the switch link out to Settings ("easiest fix"). The
smaller fix was to make the switch switch — then JC asked, mid-work, for **Hallow to be in
the list as well**, and then to **match what the Settings list has**. Final shape:

- **Pray here** — Standard Holy Rosary + the user's devotions. Choosing one calls
  `setDailyTemplate` **and**, when external was on, `updateSettings({ daily_rosary_mode:
  "app" })`. That single added line is the reported bug's fix.
- **Open in another app** — `PRAYER_APPS` rendered whole, in Settings' order, with
  Settings' names and blurbs. Choosing one sets `external` + `daily_rosary_app_id`.
- The checkmark is driven by `externalAppId` first, so it always marks the live choice.
- `Another app or website` is the one row that still needs Settings — a dialog has nowhere
  to paste a URL — so it sets the mode and navigates to `/settings`. JC's original idea,
  kept exactly where it earns its place. With a custom URL already saved, the row shows
  the domain (`dailyRosaryAppLabel`) rather than the generic name.

The shared row markup was factored into a local `Row` component so both groups render
identically.

## Verified (and how)

Browser-verified against a **real Hallow-configured profile** on the dev server, not a
mocked state: cleared to a fresh profile, went through the name prompt and onboarding,
then set **Pray my Daily Rosary → Hallow** in Settings so the Home row read
`Opens in Hallow` — the reported bug state.

- devotion while external → row became `Caro Family Rosary · Joyful Mysteries`, and the
  action button's label changed to **"Begin the daily rosary"** (in-app play)
- Hallow from the same dialog → row returned to `Opens in Hallow` with the external link
- reopened picker while external → the **only** checkmark was on `Hallow`
- `Another app or website` → `location.pathname === "/settings"`
- both dialog groups read back in full: Standard Holy Rosary + 14 devotions under
  **Pray here**; Hallow / Amen / Come Pray the Rosary / Universalis / iBreviary / Another
  app or website under **Open in another app** — matching Settings
- `npx tsc --noEmit` clean (one `exactOptionalPropertyTypes` error on the `Row` subtitle
  prop was caught and fixed: `subtitle?: string | undefined`)

⚠️ **The port-8080 gotcha again** — `.claude/launch.json` pins 8080, something stale still
holds it, so vite fell back to **8081** while the preview harness had been handed a
different port entirely; the harness tab was dead until pointed at 8081 by hand. Local
gate bypassed with the `acts-beta-unlocked-v1` localStorage key, as usual.

⚠️ **The Browser pane was hidden for part of the session**, so `computer` scroll/hover
actions timed out while `screenshot`, `javascript_tool` and `get_page_text` kept working.
Driving the dialog with `javascript_tool` clicks was the way through.

## Git state at handoff

`8da86e2` (code) + `74acf68` (story docs) and the close commit `a265367` are all on
`origin/main` — **JC pushed each of them**, promptly, within minutes of the commit.

⚠️ **Do not `git commit --amend` in this repo.** This session amended the already-pushed
`a265367` into `c76380e` to correct a wrong push claim, which diverged local from remote
and gave JC three conflicted files on the next `git pull` — `docs/JIRA-BACKLOG.md`,
`stories/README.md` and this file, the exact three the amend touched. Resolved by keeping
the corrected text. **JC pushes fast and Lovable writes straight to `main`: treat every
commit as already published and correct it with a follow-up commit, never an amend.**

⚠️ `git push` fails from this environment as always (`could not read Username for
'https://github.com'`), confirmed again on the close commit. A first reading of
`origin/main` carrying the earlier two suggested the error was cosmetic — it is not; JC
had pushed in between. **Confirm with `git log @{u}..HEAD` rather than inferring from
either the error or the remote ref.**

⚠️ `stories/ACTS-162.md` was **already modified in the working tree before this session
started** (a concurrent session holds ACTS-162 open) and was deliberately **left unstaged
and untouched** — the same collision ACTS-165 hit and had to absorb.

## Closing state

JC verified the fix in the app and closed the story. All acceptance criteria met.

**The port-8080 holder is gone.** JC asked for it to be killed; by then nothing held it —
`lsof` found no listener on 8080 or 8081, `ps` no vite processes, the preview registry
empty. The stale server died with a session restart. A fresh `preview_start` then bound
**8080 with no fallback**, confirming the gotcha is cleared for now. Worth knowing: the
holder is a dev server from an earlier *Claude session*, not a system service — ending
that session frees it.

## Next

- The **integration test named in the Tests section is the real follow-on** — a render
  test asserting the row leaves Hallow is exactly the regression that was missing here.
  Blocked on the ACTS-92 harness like everything else.
- Settings and this dialog now express the same choice in two different UIs. If a third
  surface ever needs it, extract a shared `DailyStartPicker` rather than mirroring again.
