---
id: ACTS-153
title: First-launch onboarding — ask Bible app + Daily Rosary (defaults, changeable in Settings)
spine:
status: To Do
origin: human-typed
depends_on: []
relates_to: [ACTS-133, ACTS-82, ACTS-144, ACTS-143]
started_at: 2026-09-04T19:54:08-0700
updated:    2026-09-04T19:54:08-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone opening Oravia for the first time, I want to be asked two quick questions —
**where I read Scripture** and **how I pray my daily rosary** — so the app fits the habits
I already have, without hunting through Settings first. Both questions have a sensible
default, and both say plainly that I can change the answer later.

## Background
Both settings **already exist and already work** — this story adds no new capability, only
the *asking*. Today they are discoverable only by visiting `/settings`:

- **Bible** — `settings.bible_app_id` + `bible_translation` (+ `bible_app_custom_url` for
  "another app"), catalog in [`src/lib/bible/apps.ts`](../src/lib/bible/apps.ts).
  Defaults today: `DEFAULT_BIBLE_APP = "youversion"`, `DEFAULT_TRANSLATION = "NIV"`.
- **Daily Rosary** — `settings.daily_rosary_mode` (`"app"` | `"external"`) +
  `daily_rosary_app_id` + `daily_rosary_custom_url`, catalog in
  [`src/lib/prayer/apps.ts`](../src/lib/prayer/apps.ts) (Hallow, Amen, Come Pray the
  Rosary, Universalis, iBreviary, "Another app or website"). Shipped in **ACTS-133**.

The entry surface that exists is [`src/components/beta-gate.tsx`](../src/components/beta-gate.tsx)
— passcode (optional) → name (`settings.display_name`) → app. Onboarding is the third step
of that same sequence.

## Acceptance criteria
- [ ] **When it runs.** After the name step, on first launch only — one question per screen,
      in the existing `GateShell` (same wordmark/tagline frame), so it reads as one arrival.
- [ ] **Q1 — Your Bible.** Choose the Bible app (from `BIBLE_APPS`) and translation (from
      `BIBLE_TRANSLATIONS`); "Another app" reveals the custom-URL field, exactly as Settings
      does. **Default if skipped or dismissed: YouVersion + NIV** (the existing constants —
      no new default is introduced).
- [ ] **Q2 — Daily Rosary.** "In this app" vs "In another app I already use". In-app →
      `daily_rosary_mode: "app"` (the default). Another app → the `PRAYER_APPS` picker,
      with the custom URL field when "Another app or website" is chosen, and the chosen
      app's `blurb` shown as help text. Answering "another app" is what
      **ACTS-133**'s external launch already consumes — nothing downstream changes.
- [ ] **Both screens say where to change it later** — one quiet line naming Settings
      (e.g. "You can change this any time in Settings"), matching the Settings copy voice.
- [ ] **Skippable.** A "Not now" / "Skip" path on each question leaves the defaults in
      place and writes no setting other than the completion marker.
- [ ] **Never asked twice.** A completion marker is persisted so onboarding does not
      reappear after reload — see the decision below. Answering, skipping, and closing
      the last screen all mark it complete.
- [ ] **Existing installs are never interrupted.** Anyone whose store already holds a
      `display_name` (current beta testers) is treated as already onboarded.
- [ ] **Guest links bypass it.** `/follow/*` share links (ACTS-94) skip onboarding as they
      already skip the passcode and name steps.
- [ ] **One source of truth.** Every write goes through the store's `updateSettings` —
      the same fields Settings edits, no parallel onboarding state. Whatever is answered
      here shows as the current value on `/settings` immediately.
- [ ] `tsc --noEmit` clean; browser-verified from a **cleared** `localStorage` (full first
      run) *and* from an existing store (must not appear).

## Decisions to make first
1. **The completion marker.** Inferring "onboarded" from `bible_app_id` being set does
   **not** work — skipping leaves it absent, so the flow would return every launch.
   Proposal: a new additive `AppSettings` field, `onboarding_completed_at?: string` (ISO),
   written on finish/skip. Additive → **no `STORAGE_KEY` bump** (currently `v39`; a bump
   would wipe testers' data, see the reseed gotcha).
2. **Where the flow lives.** Extend `BetaGate` with steps 3–4, or a separate
   `<Onboarding>` component rendered by `BetaGate` after the name step. The second keeps
   the gate file honest (the gate is about *access*; this is about *preferences*) and is
   the recommended shape.
3. **Copy.** The Oravia brand-voice lines captured in **ACTS-144** (the weaving / "seek"
   lines) were explicitly parked for "hero/onboarding" and never placed — this is the
   surface they were written for. Pick them here or decide they stay unused.
4. **How much to ask.** Two questions is the ask. If translation feels like a third
   question, it can ride inside Q1 as a second field (the Settings layout already pairs
   them) rather than becoming its own screen.

## Out of scope
- Any change to how the Bible deep-link or the external Daily Rosary launch *behaves* —
  ACTS-133 and `buildPassageUrl` stay exactly as they are.
- Re-onboarding / "run the setup again" from Settings. Settings already edits both
  values directly; "Start over" (clear the store) replays onboarding as a side effect.
- Accounts, sync, or moving these settings off the local store (ACTS-82/87/88).

## Tests
- **Unit** (Vitest — pure `src/lib/**`): the onboarding predicate + default resolution —
  `needsOnboarding(settings)` false when the marker is set, false when a `display_name`
  exists from a pre-onboarding install, true on an empty store; skipping resolves to
  `youversion` / `NIV` / in-app via the existing `effectiveBibleAppId`,
  `translationById`, `isExternalDailyRosary`.
- **Integration** (Testing Library — component + store): render the flow on an empty
  store — answer both questions and assert `updateSettings` wrote the expected fields;
  skip both and assert only the marker was written; re-render and assert the flow is
  gone; render with an existing `display_name` and assert it never appears.
- **E2E** (Playwright — see [the plan](../docs/E2E-TEST-PLAN.md)): feeds **E15**
  (Settings & persistence — answers survive reload and show on `/settings`) and **E13**
  (Bible deep-link out — the app chosen at onboarding is the one that opens). No runner
  yet (ACTS-92), so coverage stays **planned**.
