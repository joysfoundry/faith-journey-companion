---
id: ACTS-133
title: Daily Rosary — launch an external app (Hallow) instead of the in-app session
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-99, ACTS-100]
started_at: 2026-09-02T10:20:50-0700
updated:    2026-09-02T10:20:50-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone who prays my daily rosary in Hallow, I want the app's Daily Rosary to
launch Hallow (deep-linked to its daily/rosary page) so I can hand off from
journaling — or from already being in the app — without the built-in in-app rosary
getting in the way.

## Context / approach (recorded decision)
Setting-driven, **not** a `KnowledgeItem`/"program" model. The Daily Rosary is
already a setting ("which devotion is daily" — `settings.daily_template_id`,
rendered as a pinned virtual row in `src/routes/pray.tsx:452`), not stored data, and
a novena can already stand in for it via `fulfills_daily_rosary`. So "launch Hallow
instead" is a second way that same slot can resolve — a setting, resolved at the row.

This reuses the *deep-link-out idiom* proven in `src/lib/bible/apps.ts`
(`resolveBibleHomeUrl` / `buildPassageUrl` driven by a Settings choice) and the
`ExtLink` row rendering used for reading programs in
`src/components/home/WordSection.tsx`. It deliberately does **not** reuse the
`KnowledgeItem` data model — a KnowledgeItem carries status/Voices/Library/"finishes"
semantics; the daily rosary is endless. Because it's one pinned row that changes
behavior, there is **nothing to hide/duplicate** — that's the win over the
"program under word, but for rosary" framing.

Scope: **strictly the Daily Rosary slot.** No "Open Hallow" affordance on the
journaling/reflections screen in this story (possible follow-on).

### Hallow targets — VERIFIED 2026-09-02
Sources: Hallow's `apple-app-site-association` + `assetlinks.json` (authoritative),
App Store listing.

**Decisive finding — one URL already handles both web and app:**
`https://hallow.com/collections/16/` is simultaneously a valid **iOS Universal Link**
and **Android App Link**, because `/collections/*` is in the handled-paths list on
both platforms. So this single https URL opens the **native Hallow app when installed**
and the **web page otherwise** — OS-handled, automatically, per device. No separate
"app URL" is needed for the graceful case.

Verified identifiers (for reference / store fallback):
- **iOS** — AASA appIDs: `DHUN2XW8D4.app.hallow.Hallow` (+ `.debug`, `.qa`);
  webcredentials app `DHUN2XW8D4.app.hallow.Hallow`. App Store id **1405323394**
  ("Hallow: Prayer & Meditation", Hallow, Inc.).
- **Android** — assetlinks package **`app.hallow.android`** (App Links verified for the
  domain; `/collections/*` covered). Play id `app.hallow.android`.
- **Custom scheme (`hallow://`)** — none found publicly / undocumented. Not needed, and
  would break the web fallback anyway.

**Implication for the "Web vs App on phone" choice (needs a call — see session note):**
Because the same URL auto-opens the app when installed, we get "open the app on phone"
for free. The only thing a toggle could add is *forcing the web version even when the
app is installed* — and that is **not reliably achievable from a browser web app**
(there is no clean cross-platform way to defeat Universal/App Links from an anchor).
So the honest options are:
  - **(A, recommended)** one Hallow option using the single smart URL
    `https://hallow.com/collections/16/` — "just works" per device; drop the toggle.
  - **(B)** keep a best-effort Web/App preference, understanding "force web on phone"
    can't be guaranteed.
- **Fallback chain:** chosen URL → `https://hallow.com/collections/16/` → `hallow.com`.

## Acceptance criteria (decision A — single smart URL, no web/app toggle)
- [ ] Settings gains a **Daily Rosary** mode: *In the app* (pick devotion — current
      behavior) **or** *In another app* (Hallow / custom URL), persisted on `settings`
      (e.g. `daily_rosary_mode`, `daily_rosary_app_id`, `daily_rosary_custom_url`).
- [ ] When mode = external, the pinned Daily Rosary row in `pray.tsx` opens the URL in
      a new tab (`ExtLink` idiom) instead of calling `beginDailyRosary()` — one row,
      no duplicate to hide.
- [ ] Small prayer-app catalog `src/lib/prayer/apps.ts` (parallel to `bible/apps.ts`):
      Hallow with a single `url` = `https://hallow.com/collections/16/` (a verified
      iOS Universal Link + Android App Link — opens the native app on phone when
      installed, web otherwise, automatically per device) + "another app" custom URL.
      Resolver falls back: chosen URL → `hallow.com`.
- [ ] **No web-vs-app toggle** — one URL already does the right thing per device
      (verified); "force web on phone" isn't reliably deliverable from a browser web app.
- [ ] Existing `fulfills_daily_rosary` novena-defer behavior is unaffected — a novena
      standing in for the Daily Rosary still wins over the external launch.
- [ ] **Auto-log as prayed (JC decision):** launching the external app also logs a
      completed, item-less session for today so history/streaks count it. Idempotent
      (one external daily log/day). Applied to BOTH launch surfaces — Home "Today"
      daily card (`index.tsx`) and the Plan pinned row (`pray.tsx`). Session detail
      shows a "Prayed in {app}" record (not an empty prayer list) for external logs.

## Catalog (PRAYER_APPS) — verified 2026-09-02
Flattened Settings to ONE dropdown (In the app / named apps / Another app or website)
after JC couldn't find the custom-URL option nested under a second picker.
- **Hallow** — `https://hallow.com/collections/16/` — verified iOS Universal Link +
  Android App Link to the actual rosary (native on phone, web otherwise). Ideal.
- **Amen** (Augustine Institute) — `https://amenapp.org/app/` — verified iOS Universal
  Link + Android App Link (`H3Z22FN57J.org.amenapp.amen`, `/app/*`). Opens the Amen app
  on phone (lands on app home — no public one-tap rosary URL; JC OK'd app-home landing),
  web otherwise.
- **Come Pray the Rosary** — `https://www.comepraytherosary.org` — web-launch; genuine
  live/audio rosary site (verified loads).
- **Universalis** — `https://universalis.com` — web-launch; Liturgy of the Hours, NOT
  rosary-specific (`/rosary.htm` 404s). Added per JC's "web-launch entries" choice.
- **iBreviary** — `https://www.ibreviary.com` — web-launch; Liturgy of the Hours, not
  rosary-specific. Added per JC's choice.
- **Another app or website** — user pastes any URL (`daily_rosary_custom_url`); label
  shows the URL's domain (e.g. "hallow.com").

Label: the in-app option reads **"In this app"** (was "In the app").

Research notes (why not more named native apps): most Catholic apps don't expose a
deep-linkable rosary page with a verified universal link. **Amen** added at app-home
level (no public one-tap rosary URL; JC OK'd app-home landing). **Laudate** is app-only
(no web URL to link). Universalis app claims only `/qr/*`; iBreviary has no AASA — both
added as web-launch. → the custom-URL box covers the long tail.

## Adding more apps to the dropdown
- **No code:** pick "Another app" in Settings and paste any URL (`daily_rosary_custom_url`).
- **Named catalog entry:** add `{ id, name, blurb, url }` to `PRAYER_APPS` in
  `src/lib/prayer/apps.ts`. For native-app open on phone, use the app's universal/app-link
  URL and verify its path is claimed (the app's `apple-app-site-association` / `assetlinks.json`).

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md)._
- **Unit** (Vitest — `src/lib/prayer/apps.ts`): app-by-id lookup, effective URL
  resolution (Hallow → daily page; "other" → custom URL; empty/blank → fallback).
- **Integration** (Testing Library): Settings Daily Rosary mode toggle persists to
  `settings`; `pray.tsx` pinned row renders `ExtLink` when external vs the
  begin-session button when in-app; a standing-in novena still overrides both.
- **E2E** (Playwright): set external mode in Settings → Daily Rosary row deep-links out.
