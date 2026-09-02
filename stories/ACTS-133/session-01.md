---
story: ACTS-133
session: 01
wrapped_at: 2026-09-02T14:34:20-0700
status: Done
final: true
---

## What happened
Built the Daily Rosary "launch an external app instead of the in-app session"
capability, setting-driven (not a new session/devotion type — decision recorded to
avoid overloading `PrayerTemplate`/`KnowledgeItem`).

- `src/lib/prayer/apps.ts` (new) — prayer-app catalog + resolver, mirroring
  `bible/apps.ts`. Entries: **Hallow** (`hallow.com/collections/16/` — verified iOS
  Universal Link + Android App Link → native app on phone, web otherwise), **Amen**
  (`amenapp.org/app/` — verified universal/app link → app home), **Come Pray the
  Rosary** (web), **Universalis** + **iBreviary** (web, Liturgy of the Hours), and
  **Another app or website** (custom URL, labeled by domain).
- `AppSettings.daily_rosary_mode/app_id/custom_url`; `PrayerSession.external_app/url`.
- Settings "Daily prayer": ONE flat dropdown — "In this app" (pick a devotion) or any
  catalog app / custom URL. (Flattened after the custom-URL option was buried in a
  nested second picker.)
- Launch surfaces: Home "Today" daily card + Plan pinned row deep-link out (`ExtLink`)
  in external mode; the novena defer (`fulfills_daily_rosary`) still takes precedence.
- **Auto-log as prayed** (JC decision): launching also logs a completed, item-less
  session for today (`store.logExternalDailyRosary`, idempotent — one/day) so
  history/streaks count it. Session detail shows a "Prayed in {app}" record, not an
  empty prayer list.

Decisions: (A) single smart URL, no web/app toggle — one https URL already opens the
native app on phone and web otherwise, and "force web on phone" isn't reliably
deliverable from a browser web app; auto-log as prayed; Amen at app-home level (no
public one-tap rosary URL). Deep-link research (Laudate app-only; Universalis `/qr/*`
only; iBreviary no AASA) recorded in the pointer.

## Verified (and how)
- `tsc --noEmit` clean; no console errors (in-browser, mobile viewport).
- Settings: all dropdown states render (In this app / Hallow / Amen / Come Pray the
  Rosary / custom URL) with correct "Open {app}" hrefs; "In this app" label confirmed.
- External launch logs exactly one completed session (`external_app` set,
  `template_id: tpl-rosary`, `completed_at`); second launch is idempotent (no dup).
- Home daily card flips to "Daily Rosary · Done"; Plan Completed list shows it;
  external session detail shows "Prayed in {app}" + "Open again".
- In-app mode still starts a normal session; novena defer path untouched.

All acceptance criteria met.

## Git state at handoff
Committed & pushed to `main` (pushed by JC from their git client): `6328770` +
`ca32634` (feature + story), `0a7807f` + `28022f3` (flatten/catalog + docs). Working
tree clean except `.env` (pre-existing, unrelated, holds the beta secret — intentionally
not committed).

## Next
None — story complete. Possible follow-ons if desired: trim Universalis/iBreviary to
keep the rosary picker rosary-only; add a native one-tap Amen rosary URL if one becomes
public; an "Open Hallow" affordance on the reflections/journaling screen (out of scope
here — this story was strictly the Daily Rosary slot).
