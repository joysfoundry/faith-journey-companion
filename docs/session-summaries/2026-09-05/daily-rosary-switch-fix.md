# Session — the Home daily-rosary switch (ACTS-166)

**Date:** 2026-09-05 (evening, after the ACTS-164 / ACTS-165 About-copy sitting)
**Stories touched:** ACTS-166 (filed, worked, closed Done in one sitting)

## What happened

**1. JC reported a bug from the Home prayer block.** The Daily Rosary row has a switch
icon that opens a "Daily devotion" picker; choosing a devotion left the row on **Hallow**.
JC's own suggestion was to make the link go to Settings instead — "easiest fix?"

**2. The cause was precedence, not a failed write.** `src/routes/index.tsx:345` decides the
whole row from one setting:

```
const externalDaily = !dailyFulfiller && isExternalDailyRosary(db.settings);
```

While `daily_rosary_mode === "external"`, the subtitle is `Opens in ${dailyAppLabel}` and
the action is the external launch link. The picker's `onChoose` was `setDailyTemplate`,
which wrote `daily_template_id` correctly — but **nothing on that row reads it in external
mode**. The setting was saved every time; the UI was looking somewhere else. Settings
never showed the symptom because it hides its devotion select entirely while external.

**3. Scope grew twice, both times on JC's call, mid-work.** The first fix was one line
(choosing a devotion also sets `daily_rosary_mode: "app"`). Then JC: *"hallow app should be
in the list as well"*. Then: *"match what settings list has"*. Final shape — one dialog,
two groups:

- **Pray here** — Standard Holy Rosary + the user's devotions; choosing one also returns
  the daily to in-app.
- **Open in another app** — all of `PRAYER_APPS`, in Settings' order with Settings' names
  and blurbs, `Another app or website` included.
- The checkmark binds to `externalAppId` first, so it always marks the **live** choice.
- `Another app or website` needs a URL and a dialog has nowhere to paste one, so it sets
  the mode and navigates to `/settings` — JC's original "link to settings" instinct, kept
  for the one case that actually earns it.

**4. Non-story: the port-8080 holder.** JC asked to kill whatever was holding the server.
By then nothing was — no listener on 8080 or 8081, no vite processes, empty preview
registry. It had died with a session restart, and a fresh `preview_start` bound **8080
with no fallback**. Recorded that the holder is always a dev server from an earlier
*Claude session*, not a system service.

**5. Non-story: a wrong push claim, caught and corrected.** After the close commit,
`origin/main` was found to already carry the two ACTS-166 commits, which read as "push
works despite the error". It does not — **JC had pushed them in between**. The board,
ledger and handoff text were amended before the mistake could mislead a later session.

## Verified (and how)

Browser-verified against a **real Hallow-configured profile** on the dev server — fresh
profile, name prompt, onboarding, then **Settings → Pray my Daily Rosary → Hallow** so the
Home row genuinely read `Opens in Hallow` before testing.

- devotion while external → row became `Caro Family Rosary · Joyful Mysteries`, action
  label changed to **"Begin the daily rosary"** (in-app play, not the external link)
- Hallow from the same dialog → row returned to `Opens in Hallow`
- picker reopened while external → the **only** checkmark was on `Hallow`
- `Another app or website` → `location.pathname === "/settings"`
- both groups read back in full and match Settings' list
- `npx tsc --noEmit` clean (one `exactOptionalPropertyTypes` error on the `Row` subtitle
  prop was caught and fixed during the work)

JC then verified in the app and closed the story.

## Git state at handoff

**Committed-not-pushed**, one commit:

- `c76380e` — `docs: close ACTS-166 (Done) — JC-verified, final handoff` ⚠️ **needs JC's push**

Already on `origin/main` (pushed by JC mid-session): `8da86e2` (code) + `74acf68` (story
docs).

⚠️ `git push` fails from this environment as always: `could not read Username for
'https://github.com'`. **Confirm push state with `git log @{u}..HEAD`** — not by reading
the error, and not by seeing commits on the remote ref.

⚠️ `stories/ACTS-162.md` has been **dirty in the working tree since before this session**
(a concurrent session holds ACTS-162 open). Left unstaged and untouched throughout —
unlike ACTS-165, which had to absorb it into a close commit.

## Parked / next

- **The missing regression test is the real follow-on.** An integration test — render Home
  with `daily_rosary_mode: "external"`, open the picker, pick a devotion, assert the row
  leaves Hallow — is exactly what would have caught this. Named in the story's Tests
  section; blocked on the **ACTS-92** harness like everything else.
- **Settings and this dialog now express the same choice in two UIs.** If a third surface
  ever needs it, extract a shared `DailyStartPicker` rather than mirroring a third time.
- **ACTS-147 (PRD resync)** remains open and is drifting further — the About page changed
  twice earlier today, and the daily-start behaviour changed now.

## Next session — opener (paste to start)

> Oravia. Last session fixed the Home Daily Rosary switch (**ACTS-166**, Done,
> JC-verified): the row is decided by `daily_rosary_mode`, so while Hallow was on, the
> picker's `daily_template_id` write was read by nothing. The picker now holds both halves
> of the choice — devotions and the full Settings app list — and choosing a devotion
> returns the daily to in-app.
>
> **First:** `git push` — `c76380e` (the ACTS-166 close) is committed and unpushed; push
> fails from the Claude Code environment, so push from your own git client. Note
> `stories/ACTS-162.md` is dirty from a concurrent session — leave it alone.
>
> **Open on the board:** **ACTS-163** (guided tour — numbered hotspots) and **ACTS-162**
> (send feedback from the menu, held by another session) are To Do. **ACTS-147** (PRD
> resync) is the one quietly falling behind — the About copy and now the daily-start
> behaviour have both moved since it was last true.
>
> **If you want the regression net first:** ACTS-92 (test harness) is the blocker under
> every story's Tests section, ACTS-166's included.
