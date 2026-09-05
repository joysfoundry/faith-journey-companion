---
story: ACTS-153
session: 01
wrapped_at: 2026-09-04T20:35:33-0700
status: Done
final: true
---

## What happened
Built the first-launch onboarding: two questions asked once, after the beta name step.
**Q1 — your Bible** (app from `BIBLE_APPS` + translation, custom URL for "another app").
**Q2 — your daily rosary** (in this app, or launch one you already use — the ACTS-133
external path, with its custom-URL case). Both skippable; both carry "You can change this
any time in Settings"; every field writes through the store's `updateSettings`, so an
answer here is the same value Settings edits.

New: `src/lib/prayer/onboarding.ts` (pure), `src/components/onboarding.tsx`, and
`src/components/gate-shell.tsx` — the arrival frame extracted from `beta-gate.tsx`,
which stays about *access* while onboarding owns *preferences*.

### Decisions (JC)
1. **Everyone is asked once**, current testers included — not just brand-new installs.
   That rules out inferring "already asked" from existing data, so completion is a real
   field: `settings.onboarding_completed_at`, written on finish **and** on skip.
   Additive → **no `STORAGE_KEY` bump** (still v39).
2. **`DEFAULT_TRANSLATION` NIV → NABRE.** Raised because Oravia is Catholic: NIV omits
   the deuterocanon and the USCCB readings the Word page already links to *are* the
   NABRE. ⚠️ Reaches past onboarding — anyone who never picked a translation now
   resolves to NABRE; explicit choices untouched. Committed separately (`ea441e2`) so
   it can be reverted on its own.
3. **Copy:** the ACTS-144 lines parked "for hero/onboarding" are now placed — the
   search/seek split in Q1's blurb, and **"Keep your seeking for God."** under the final
   **Begin** button. Late edits (JC): Q2 reads *"How would you **like to** pray your
   daily rosary?"*, and choosing an external app now warns *"You may need to sign in to
   Hallow the first time — Oravia opens the app, it doesn't sign you in."*

### The bug this story found
Both steps render the same shapes (`GateShell → form → div → Select`). As two branches
of one component, React **reconciled instead of remounting**: the Radix `Select` carried
over from the Bible step, arrived with a stale item collection and an **empty value**, and
pressing **Begin** wrote `daily_rosary_mode: "external"` with a blank `daily_rosary_app_id`
— the opposite of the "In this app" on screen, and a state that would have sent the Daily
Rosary row to Hallow's home page. Fix: each step is its own component (`BibleStep` /
`RosaryStep`), forcing the unmount/mount. Worth remembering for any wizard that swaps
same-shaped steps in place.

## Verified (and how)
- **Unit** — Node `--experimental-strip-types` harness against the real module
  (the ACTS-135 pattern): `onboarding.ts` **11/11**, including "an existing tester with
  answers but no stamp *is* asked".
- **Browser** (dev server, all four paths): answer both → NABRE + `daily_rosary_mode: "app"`
  + stamp, lands on Home; reload → not asked again, Settings shows all three; skip both →
  **only** the stamp written, effective defaults still YouVersion · NABRE · In this app;
  choose Hallow → `external` + `hallow`, and Home's row becomes "DAILY ROSARY — Opens in
  Hallow" with a real link; `/follow` guest with no stamp → guest view, onboarding never
  appears, stamp stays unwritten.
- `tsc --noEmit` clean; no console errors.
- ⚠️ The two late copy edits (Q2 heading + sign-in reminder) are `tsc`-clean but **not**
  browser-verified — the dev server was stopped before they could be re-checked. JC is
  verifying.

## Git state at handoff
**Committed, NOT pushed** — `d926b94` (flow), `ea441e2` (NABRE default), `ceed2e6` (docs).
`git push origin main` failed with `could not read Username for 'https://github.com'` (the
recurring env git-auth issue). **JC must push from their git client.** `.env` is modified
and deliberately untouched.

## Next
Nothing for this story. Follow-on filed as **ACTS-154** — move the "Online Bible" link out
of the Daily Readings block onto the Word card header, where it stops reading as a child
of the readings. Optional later: the same sign-in reminder in Settings, where the external
app can also be chosen.
