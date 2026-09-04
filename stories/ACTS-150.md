---
id: ACTS-150
title: Wire dark mode (tokens exist, the .dark class is never applied)
spine: ACTS-144
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-148]
relates_to: [ACTS-148, ACTS-144]
started_at: 2026-09-04T14:36:01-0700
updated:    2026-09-04T14:36:01-0700
latest_handoff: null
sessions: 0
---

## Goal
Make dark mode reachable. `src/styles.css` has carried a complete `.dark` token block for
some time, but **nothing in `src/` ever adds the `.dark` class** — grep for it returns only
Tailwind `dark:` utilities, never a `classList` toggle or a theme provider. The tokens are
unreachable dead code and the app renders light-only.

Split out of **[ACTS-148](ACTS-148.md)** on 2026-09-04 by JC's call ("dark ship later"), so
the Marian palette can land on the light theme without waiting on this.

## Scope
- A theme setting (system / light / dark) persisted alongside the other `settings` values.
- Apply/remove `.dark` on the document root; respect `prefers-color-scheme` for "system".
- No flash of the wrong theme on first paint (resolve before hydration).
- `manifest.webmanifest` `theme_color` follows the active theme where the platform allows.

## Already done in ACTS-148
The dark **values** are chosen and contrast-verified — see
[`docs/brand/design-system/tokens.css`](../docs/brand/design-system/tokens.css) and the
Components cards, each of which shows light and dark side by side. Every dark pair clears
5.3:1. This story is the wiring, not the palette.

## Acceptance criteria
- [ ] A user can choose system / light / dark, and the choice survives a reload.
- [ ] No wrong-theme flash on load.
- [ ] Every screen browser-verified in dark: Home, a prayer session, Formation, Reflections,
      Settings, and the `/follow` guest view.
- [ ] No `STORAGE_KEY` bump (additive settings field only) — confirm before relying on this.

## Tests
_Per convention ACTS-91; no runner yet (harness = ACTS-92)._
- **Unit** (Vitest): theme resolution (system vs explicit) once a harness exists.
- **E2E** (Playwright): visual/contrast smoke on Home + a session in both themes.
