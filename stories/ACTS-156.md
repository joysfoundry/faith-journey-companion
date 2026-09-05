---
id: ACTS-156
title: Formatting toolbar (bold / italic / underline) in the reflection box, hideable
spine:
status: Done
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-136, ACTS-135, ACTS-103, ACTS-102, ACTS-139]
started_at: 2026-09-04T21:22:36-0700
updated: 2026-09-04T22:06:43-0700
latest_handoff: stories/ACTS-156/session-01.md
sessions: 1
---

## Goal
As someone journaling, I want to **bold, italicise and underline** while I write a
reflection — and I want the toolbar **out of the way** when I just want to write freely —
so emphasis is possible without the composer ever feeling like a word processor.

## Why — where it stands today
The reflection body is a plain `<Textarea>` over a plain `body: string`
([`ReflectionComposer.tsx:333`](../src/components/home/ReflectionComposer.tsx)), with a
second edit textarea in the same file (~line 449) and the single-entry editor on
[`reflections.tsx:395`](../src/routes/reflections.tsx). Bodies render as plain text in
**three** places, so formatting is not a composer-only change:

- [`reflections.tsx:272`](../src/routes/reflections.tsx) — Journal list entry
- [`reflections.tsx:485`](../src/routes/reflections.tsx) — single-entry view
- [`ItemView.tsx:138`](../src/components/prayer/ItemView.tsx) — in-session reflection

## Decisions (locked with JC at filing)
- **Storage = markdown-lite in the same `body` string.** The toolbar wraps the selection
  in `**bold**`, `*italic*`, and `<u>underline</u>`. `body` stays a plain string →
  **no data-shape change, no `STORAGE_KEY` bump**, and the ACTS-94 share/follow codec and
  the ACTS-136 shared draft are untouched. Renderers gain a small inline-mark parser.
  (Rejected: contentEditable + sanitised HTML — WYSIWYG, but costs a schema decision, a
  sanitiser on every render path, and churn in the draft + share codecs.)
- **Toolbar visible by default**, collapsed by a small toggle; the preference persists.
  Discoverability for beta testers beat composer minimalism.

## Resolved while building
- **Hide preference lives in `settings`** (JC) — `reflection_toolbar_hidden?: boolean`,
  additive, **no `STORAGE_KEY` bump** (verified: the store stayed on `prayer-companion-db-v39`).
  Absent / `false` = shown, so the default needs no migration.
- **Underline marker** stays `<u>…</u>`. The parser never emits HTML, so this is inert text.
- **Title field is not formatted** — body only, as assumed.
- **Legacy bodies are safe.** The scanner matches asterisk *runs by exact length* and
  applies CommonMark's flanking rule (an opener must be followed by non-space, a closer
  preceded by non-space), so "2 * 3 and 4 * 5" and a trailing footnote `*` stay literal.
  This was found by the harness, which first read them as italics.
- **The controls live inside the field** (JC, after seeing the first cut): a bar of
  32px buttons above the textarea read as too much chrome for a page meant for writing.
  They now sit along the *inside* bottom edge at `size-7` with `size-3.5` icons — the
  strip is `pointer-events-none` so only the buttons take clicks and tapping the blank
  stretch beside them still puts the caret in the text; the textarea carries `pb-9` so a
  scrolled entry never runs underneath. Hidden, only the faint toggle remains in the
  corner. The padding is **constant** whether or not the marks show, so toggling never
  resizes the field — the cost is a small empty band in the hidden state.
- **Three writing surfaces, not two.** The toolbar is one shared `RichTextArea`, so it
  also serves the journal entry's **edit** view and the **in-session Lectio card** — those
  render the same marks and had to honour the same setting anyway.

## Acceptance criteria
- [x] A toolbar with **B** / *I* / U sits inside the body field along its bottom edge;
      clicking applies to the current selection, or inserts an empty pair at the cursor
      with the caret between.
- [x] `⌘/Ctrl+B`, `⌘/Ctrl+I`, `⌘/Ctrl+U` apply the same marks **whether or not the
      toolbar is visible**.
- [x] A toggle hides/shows the toolbar; the choice **persists** across reloads and is the
      same on Home and `/reflections` (both composer instances).
- [x] Formatting survives the shared in-progress draft (ACTS-136) — type formatted text on
      Home, switch to `/reflections`, it's intact.
- [x] Marks **render** (not shown raw) in all three read surfaces: Journal list,
      single-entry view, in-session `ItemView`.
- [x] Editing an existing entry shows the markers in the textarea and round-trips
      unchanged when re-saved.
- [x] Existing plain-text reflections render exactly as before — **no migration, no
      `STORAGE_KEY` bump**.
- [x] The parser escapes HTML; nothing but the three supported marks is interpreted.

## Tests
- **Unit** — `scripts/verify-richtext.ts`, **33/33 green** against the real module
  (`npx tsx scripts/verify-richtext.ts`; the plain-tsx harness convention of ACTS-155, not
  the deferred Vitest runner of ACTS-92). Covers each mark alone and nested, `***x***`
  (bold+italic — which the toolbar itself produces on a second click), unclosed markers
  left literal, arithmetic asterisks, a trailing footnote `*`, `<script>` treated as text,
  newlines preserved, and the selection helper: wrap, unwrap both ways, reversed
  selection, whitespace kept outside the marks, empty-selection caret placement, and
  wrap→unwrap round-tripping to the original string.
- **Integration / E2E** — browser-verified by hand in the running app rather than by a
  runner (none is wired yet; see [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md),
  harness = ACTS-92). What was exercised: toolbar buttons and ⌘B/⌘I/⌘U on a real
  selection; the shortcuts still firing with the toolbar hidden; a second click
  unwrapping; the hide preference persisting through a full reload; a formatted draft
  surviving in `prayer-companion-reflection-draft-v1`; save → the body stored *verbatim*;
  and the marks rendering in the Journal list, the sitting-group preview and the
  single-entry dialog, with `<script>alert(1)</script>` escaped to visible text.
- **Not browser-verified:** `ItemView`'s saved-response render, which surfaces in the
  read-only `/follow` guest view — it uses the same `<FormattedText>` proven on the other
  three surfaces and is covered by `tsc`, but no guest link was opened.
- **Gates:** `tsc --noEmit` clean · `vite build` clean · the other two harnesses still
  green (liturgical 19/19, verify-merge PASS) · **zero new lint errors** (the eight
  touched/new files lint clean; the repo's 316 pre-existing problems are unchanged).
