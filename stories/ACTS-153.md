---
id: ACTS-153
title: First-launch onboarding — ask Bible app + Daily Rosary (defaults, changeable in Settings)
spine:
status: In Progress
origin: human-typed
depends_on: []
relates_to: [ACTS-133, ACTS-82, ACTS-144, ACTS-143]
started_at: 2026-09-04T20:07:46-0700
updated:    2026-09-04T20:07:46-0700
latest_handoff: null
sessions: 1
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
- [x] **When it runs.** After the name step, on first launch only — one question per screen,
      in the existing `GateShell` (same wordmark/tagline frame), so it reads as one arrival.
- [x] **Q1 — Your Bible.** Choose the Bible app (from `BIBLE_APPS`) and translation (from
      `BIBLE_TRANSLATIONS`); "Another app" reveals the custom-URL field, exactly as Settings
      does. **Default if skipped or dismissed: YouVersion + NIV** (the existing constants —
      no new default is introduced).
- [x] **Q2 — Daily Rosary.** "In this app" vs "In another app I already use". In-app →
      `daily_rosary_mode: "app"` (the default). Another app → the `PRAYER_APPS` picker,
      with the custom URL field when "Another app or website" is chosen, and the chosen
      app's `blurb` shown as help text. Answering "another app" is what
      **ACTS-133**'s external launch already consumes — nothing downstream changes.
- [x] **Both screens say where to change it later** — one quiet line naming Settings
      (e.g. "You can change this any time in Settings"), matching the Settings copy voice.
- [x] **Skippable.** A "Not now" / "Skip" path on each question leaves the defaults in
      place and writes no setting other than the completion marker.
- [x] **Never asked twice.** A completion marker is persisted so onboarding does not
      reappear after reload — see the decision below. Answering, skipping, and closing
      the last screen all mark it complete.
- [x] ~~**Existing installs are never interrupted.**~~ **Reversed by JC (see Decisions):** everyone is asked once, testers included. Anyone whose store already holds a
      `display_name` (current beta testers) is treated as already onboarded.
- [x] **Guest links bypass it.** `/follow/*` share links (ACTS-94) skip onboarding as they
      already skip the passcode and name steps.
- [x] **One source of truth.** Every write goes through the store's `updateSettings` —
      the same fields Settings edits, no parallel onboarding state. Whatever is answered
      here shows as the current value on `/settings` immediately.
- [x] `tsc --noEmit` clean; browser-verified from a **cleared** `localStorage` (full first
      run) *and* from an existing store (must not appear).

## Decisions — settled 2026-09-04

1. **Who sees it — everyone, once (JC).** Not just brand-new installs: current beta
   testers get the two questions on their next launch too, since they are the people
   whose answers matter and both settings are invisible in the app today. This is why
   the marker cannot be inferred from "has data" — `needsOnboarding` reads the stamp and
   nothing else.
2. **The completion marker** — `settings.onboarding_completed_at` (ISO), written on
   finish **and** on skip. Inferring from `bible_app_id` fails: skipping deliberately
   writes no preference, so absence means both "skipped" and "never asked". Additive
   field → **no `STORAGE_KEY` bump** (still v39; a bump would wipe testers' data).
3. **Default translation → NABRE (JC).** Raised because Oravia is Catholic: NIV omits
   the deuterocanon, and the USCCB daily readings the Word page already links to *are*
   the NABRE — so the old NIV default disagreed with the app's own readings.
   `DEFAULT_TRANSLATION` moved `"NIV"` → `"NABRE"` in `src/lib/bible/apps.ts`.
   ⚠️ **Behavior change beyond onboarding:** anyone who never picked a translation
   (stored value absent) now resolves to NABRE. Explicit choices are untouched.
4. **Where the flow lives** — its own `src/components/onboarding.tsx`, not `beta-gate.tsx`.
   The gate is about *access*; this is about *preferences*. Only the frame is shared,
   extracted to `src/components/gate-shell.tsx` (`GateShell` + `Splash`).
5. **Copy — the parked ACTS-144 brand-voice lines are now placed.** The "search vs seek"
   split shows up as the Bible screen's blurb ("…so you're never hunting for the right
   page"), and the sign-off **"Keep your seeking for God."** sits under the final
   **Begin** button, which is exactly where ACTS-144 nominated it. Translation rides
   inside Q1 rather than becoming a third screen.

## The bug this story found (and fixed)

Both steps render the same shapes — `GateShell → form → div → Select`. As two branches of
one component, React **reconciled instead of remounting**, so the Radix `Select` instance
carried over from the Bible step and arrived at the Daily Rosary step with a stale item
collection and an **empty value**. Visibly the dropdown was blank; invisibly, pressing
**Begin** wrote `daily_rosary_mode: "external"` with an empty `daily_rosary_app_id` — the
exact opposite of the "In this app" the person was looking at, and a state that would have
sent the Daily Rosary row out to Hallow's home page.

Fix: each step is **its own component** (`BibleStep` / `RosaryStep`), so React unmounts one
and mounts the other. Worth remembering wherever a wizard swaps same-shaped steps in place
— a `key` would also work, but distinct components make it hard to reintroduce.

## Out of scope
- Any change to how the Bible deep-link or the external Daily Rosary launch *behaves* —
  ACTS-133 and `buildPassageUrl` stay exactly as they are.
- Re-onboarding / "run the setup again" from Settings. Settings already edits both
  values directly; "Start over" (clear the store) replays onboarding as a side effect.
- Accounts, sync, or moving these settings off the local store (ACTS-82/87/88).

## Tests
- **Unit** (Node `--experimental-strip-types` harness against the real module, the
  ACTS-135 pattern — no runner wired yet, harness = ACTS-92): `onboarding.ts` **11/11** —
  `needsOnboarding` true on an empty store, on an absent stamp and on a whitespace-only
  stamp, false once stamped; **true for an existing tester who has answers but no stamp**
  (the everyone-once decision); step order `bible → rosary → null`;
  `onboardingCompletePatch` shape, and that its output satisfies the predicate.
- **Integration** (Testing Library): planned — answer both steps and assert the patches;
  skip both and assert only the stamp is written; assert the flow is gone on re-render.
- **E2E** (Playwright): planned; feeds **E15** (settings persist across reload) and
  **E13** (the Bible chosen here is the one that opens).
- **Browser-verified** (2026-09-04, dev server, all four paths):
  - *Answer both* → `bible_app_id: youversion`, `bible_translation: NABRE`,
    `daily_rosary_mode: "app"`, stamp written; app lands on Home.
  - *Reload* → not asked again; `/settings` shows YouVersion · NABRE · "In this app".
  - *Skip both* → **only** the stamp is added (settings otherwise untouched), and the
    effective defaults still read YouVersion · NABRE · In this app.
  - *Choose Hallow* → `daily_rosary_mode: "external"`, `daily_rosary_app_id: "hallow"`,
    blurb shown, and Home's row becomes **"DAILY ROSARY — Opens in Hallow"** with a real
    `hallow.com` link (ACTS-133's path, unchanged).
  - *Guest* → `/follow` with no stamp renders the guest view; onboarding never appears and
    the stamp stays unwritten.
  - `tsc --noEmit` clean; no console errors.
