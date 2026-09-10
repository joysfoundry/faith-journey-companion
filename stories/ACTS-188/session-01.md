---
story: ACTS-188
session: 1
wrapped_at: 2026-09-10T14:18:28-0700
status: Done
final: true
---

## What happened
Shipped the Settings control that picks which seeded Bible versions appear as book
resources (and as scripture Version-picker options). New optional setting
`settings.bible_versions_shown?: string[]` — **unset = all shown**, so existing readers see
no change; no `STORAGE_KEY` bump. JC's three decisions: default = show all; toggles filter
**both** the Library and the pickers; the version-less "Bible" (Unknown) is always shown.

- Shared helpers in `src/lib/bible/apps.ts`: `shownBibleVersionIds(settings)` (unset ⇒ all;
  the preferred translation is always added back — you can't hide the one you deep-link to,
  so at least one always remains) and `shownTranslations(settings)`.
- `src/lib/prayer/store.ts`: `isBibleBookVisible(id, settings)` (non-version ids and the
  Unknown "Bible" always visible).
- Consumers wired: Settings checkbox section (`settings.tsx`), Library `items` filter
  (`formation.tsx`), both scripture Version pickers (`ReflectionComposer.tsx`,
  `knowledge.$knowledgeId.tsx`) — each appends an already-chosen-but-now-hidden version so a
  quote's link is never dropped. Field added to `AppSettings` (`types.ts`).

## Verified (and how)
Dev server (`/settings`, `/formation`, quote editor):
- Default all 9 versions checked, **NABRE disabled** ("your translation — always shown").
- Unchecking NIV materializes `bible_versions_shown` without NIV and **hides "Bible — NIV"**
  in the Library; the Unknown "Bible" and the rest stay.
- A quote linked to NIV (while NIV was off) kept its link and NIV still appeared in its
  picker (appended). All five ACs met.
- **Bug caught & fixed:** wrapping the Radix `Checkbox` in a `<label>` double-fired the
  toggle (store/DOM desync). Fixed to `Checkbox` + sibling `<Label htmlFor>`.
- Typecheck clean; zero new lint errors (repo has 48 pre-existing prettier errors, untouched).

## Git state at handoff
Committed **and pushed** by JC: `73d8214` (code), `97df1d3` (docs). This final-handoff doc
commits with the docs that close the story (docs-only; push separately).

## Next
Story complete — all acceptance criteria met. The Books-view follow-on (nest quotes under
each book; Bible reading-status; Padre Pio data fix) was split into **ACTS-189**.
