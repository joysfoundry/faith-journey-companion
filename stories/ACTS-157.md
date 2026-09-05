---
id: ACTS-157
title: Export my journey for AI insights — menu item, built-in prompt, date range
spine:
status: In Progress
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-113, ACTS-135, ACTS-103, ACTS-102, ACTS-143, ACTS-82]
started_at: 2026-09-04T22:26:03-0700
updated: 2026-09-05T00:05:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying and journaling in Oravia, I want to **export my journey as one file
with the prompt already written into it**, so I can paste it into ChatGPT or Claude and
have it surface the patterns and insights running through my devotional life — without
Oravia itself having to do any AI.

## Why — where it stands today
There is **no export of any kind** in the app. The journey lives entirely in the local
store (`Database` in [`src/lib/prayer/types.ts:827`](../src/lib/prayer/types.ts)) and can
only be read one screen at a time. The user can see today; they can't see the shape of a
season.

The in-app version of this — grounded Insights feeding user-named **Wisdom** with evidence
links — is **ACTS-113** (To Do, "future longitudinal intelligence", PRD §1A/3/28/32). This
story is deliberately **not** that: it ships the value now by handing the user their own
data and letting them run it in the assistant they already pay for. ACTS-113 stays open.

## Decisions (locked with JC at filing)
- **Contents: all four layers.** Reflections/journal **+** prayer sessions **+**
  intentions & Mass experiences **+** formation/knowledge items. Rhythm and what-I-was-
  carrying are as much of the pattern as the writing is.
- **Placement: its own secondary nav entry**, alongside About and Settings in
  [`nav-links.ts`](../src/components/layout/nav-links.ts) → side rail + mobile drawer
  (the ACTS-143 About precedent). Discoverability beat a shorter nav.
- **Delivery: both.** A **Download `.md`** and a **Copy to clipboard** button. Clipboard is
  what actually works on a phone; the file is what works on desktop and can be kept.
- **Range: "Everything (start → today)" or a custom from/to.** Everything is the default.
- **Format: one Markdown document.** Markdown is what both ChatGPT and Claude read best,
  and it stays readable to a human who just opens the file.
- **The prompt ships inside the document**, at the top, so the user pastes one thing.

## Shape of the exported document
1. **Prompt header** — the instructions the user would otherwise have to write: what this
   data is, that it's one person's devotional record, and what to look for (recurring
   themes, movement over time, questions the person keeps returning to, what's grown
   quiet, what to bring to prayer next). Includes the **guardrails** the PRD is explicit
   about: *don't claim to speak for God, don't hand down discernment, name patterns and
   ask questions — the user does the discerning.*
2. **Context block** — the range covered and simple counts per layer.
3. **The journey**, in chronological sections — reflections (title, body, themes, what
   each was linked to), sessions prayed (devotion, date, completed or not, external app),
   intentions, Mass experiences (church/celebrant/notes), formation items and their
   status.

## Resolved while building
- **The prompt is editable in the app.** It sits in a collapsed "The prompt" section on the
  export screen as a real textarea with a **Reset to the default** button — so the wording
  can be iterated by using it, not by guessing at it, and so a user can aim it
  ("focus on Lent") instead of taking ours. `DEFAULT_INSIGHT_PROMPT` lives beside the
  builder in `journeyExport.ts`.
- **Range filter key, decided per layer** and **stated inside the document** so no reader is
  misled: reflections / sessions / intentions by `created_at`; a **Mass by its own `date`**
  (the day attended, not the day it was typed up); a **KnowledgeItem by `start_date` when it
  has one, else `created_at`** — which is when it was *saved to the library*, not read.
- **Size** is answered by showing it, not by capping it: the screen prints "About N words"
  and, past `OVERSIZE_CHARS` (200k chars ≈ 50k tokens), says the file may not paste into one
  chat and that narrowing the dates will help. Nothing is blocked.
- **Photos and audio are named, never silently dropped** — "2 photos (not included — images
  can't be exported as text)"; a Mass with a recording says so. A ready transcript *is*
  included. Common prayer texts are excluded on purpose, and the document says why: they're
  the Church's words, not the user's.
- **Privacy line written and placed last, right above the buttons** — the file is built on
  the device and Oravia sends it nowhere, but pasting it hands it to that company's servers
  under their terms. Stated as the user's call to make, not as a warning to click past.
- **Nav label is "Export journey"** (`FileDown`), placed next to "Add prayers" — the import
  and the export sit together. Not "Insights": that name belongs to **ACTS-113**, and this
  screen generates none.

## ⚠️ Found while verifying
`quoteBody()` falls back to `title` "for legacy safety" — so every **book** in the library
printed its own title back as a blockquote under its own heading. Guarded with `isQuote()`.
Same pass: a quote's heading was `contentTitle()`, a 57-character snippet of the very text
printed underneath it — now headed simply "Quote". Both are covered by harness checks.

## Added after the first cut — "Since last export" (JC)
A third range option: everything since the last export the user actually **took**.

- **Stamped on take, not on view.** `settings.last_export_at` (additive, **no `STORAGE_KEY`
  bump** — the ACTS-153/156 precedent) is written by Copy and by Download only. Opening the
  page, changing the range or editing the prompt must never move the marker, or the next
  catch-up would skip entries the user never received.
- **The window opens ON the day of the last export, not the day after.** Ranges are
  date-granular: exporting Thursday morning and journaling Thursday night would lose that
  entry forever if the window opened Friday. Overlapping the day re-sends at most a few
  same-day entries — harmless to read twice, unlike a silent gap. The screen says so.
- **Hidden until it means something** — no stamp, no option, and a "since" selection with no
  stamp falls back to Everything rather than exporting an empty window.
- **It leads when it exists.** Repeat visits are the common case; a first-time visitor has
  nothing to catch up on and gets Everything.

## ⚠️ Found while verifying "Since last export" — a real bug in the first cut
The stamp is `new Date().toISOString()` (**UTC**, like every `created_at` in this store), and
the builder was filing entries by `iso.slice(0, 10)`. So an evening export in a negative-offset
zone stamped **tomorrow**, and the catch-up window opened in the future — the exact gap the
day-overlap was designed to prevent. Verified live: `2026-09-05T05:48:23Z` was rendering as a
window starting `2026-09-05` while the app's own "today" was `2026-09-04`.

Underneath it sat the larger version of the same bug, which was **not** specific to the new
option: **every** layer was filed by its UTC day, so a reflection written at 8pm Pacific was
filed under tomorrow — out of step with every date the app displays, and outside a range the
user picked ending that day. `dayOf()` now converts to the **local** calendar day, and returns
an already-plain date (`MassExperience.date`, `KnowledgeItem.start_date`) as written rather
than re-parsing it as UTC midnight and shifting it a day backwards. This is the trap
`todayISO()` documents in `compiler.ts`; the harness pins `TZ=America/Los_Angeles` so the
assertions mean something.

## Anchored to the user's own entries (JC)
With an empty journal the label read **"Everything — 2023-12-31 to today"**: every seeded row
carries `now = "2024-01-01T00:00:00.000Z"` (UTC midnight → Dec 31 in Pacific), so a brand-new
user was told their journey began years before they installed the app.

- That constant is now exported as **`SEED_EPOCH`** from `seed.ts` — one sentinel on all 48
  pre-installed records, and a real record (`new Date().toISOString()`) can never equal it, so
  an exact match is a reliable "this came with the app" test. No id-prefix guessing.
- **`journeyDateBounds` counts only the user's own rows**, so the label and the date picker's
  opening value anchor to their first real entry; an untouched install reads
  "Everything — Your whole journey".
- Seeded library items are **kept, not dropped** — someone may genuinely be working through
  the pre-installed Bible in a Year — but they are **headed by name alone** (their only date
  is the install stamp) and **flagged "came with the app, not chosen"**, so an assistant can
  never read them as evidence of what this person was drawn to. Rejected: dropping them
  (loses a program in real use) and date-filtering them out (would drop a *touched* one too).

## Acceptance criteria
- [x] A new **secondary nav entry** opens an export screen, present in both the desktop
      side rail and the mobile drawer.
- [x] **Since last export** — offered only once something has been exported, leading by
      default when it is, and stamped only when the file is actually taken.
- [x] The screen offers **Everything (start → today)** (default) and a **custom date
      range** with from/to; an empty range is handled gracefully (clear "nothing in this
      range" state, no broken file).
- [x] **Download** writes a `.md` file with a dated, recognisable filename.
- [x] **Copy to clipboard** copies the identical document and confirms it copied.
- [x] The document opens with the **prompt**, then a context block, then the journey.
- [x] All four layers are included and correctly filtered by the chosen range.
- [x] The "Everything" label and the date picker anchor to the user's **own** first entry,
      never to the pre-installed library's install stamp.
- [x] Reflections carry their **themes** (ACTS-135) and their **links** resolved to
      readable names — not raw ids.
- [x] Markdown-lite marks from ACTS-156 (`**bold**`, `*italic*`, `<u>u</u>`) pass through
      as-is — they're already valid markdown and need no conversion.
- [x] A plain-language line states that the file is generated **on the device** and that
      pasting it into an AI service sends it there.
- [x] **Read-only** — the export never mutates the store. **No `STORAGE_KEY` bump**
      (the range/last-used choice may persist in `settings`, additive, if it persists at all).

## Tests
- **Unit** — `scripts/verify-journey-export.ts`, **57/57 green**
  (`npx tsx scripts/verify-journey-export.ts`; the plain-tsx harness convention of
  ACTS-155/156, not the deferred Vitest runner of ACTS-92). Runs the real builder over a
  hand-built fixture `Database`: both range boundaries **inclusive**, a day past an entry
  excluded, open-ended windows in both directions, all-time, an empty window, an empty store,
  oldest→newest ordering, link ids resolved to titles with **no raw id leaking**, themes
  present/absent, an external-app session, an unfinished session, a Mass filed by `date` not
  `created_at`, a book filed by `start_date`, ACTS-156 markdown-lite marks passing through
  untouched, photos named, a pasted passage carried as a quote, the prompt appearing
  **exactly once**, a custom prompt fully replacing the default, the "never speak for God"
  guardrail present, both filename shapes, and the two quote-fallback regressions above. Plus, for the catch-up window: no stamp
  yields no window; the window opens on the day of the export; **an evening (UTC-rolled) export
  does not open it in the future**; an entry written after that day's export is still caught; a
  same-day re-export narrows to today alone. And for local-day filing: an 8pm-Pacific entry
  lands on the local day and **not** on the following UTC day, and a plain calendar date is
  never re-parsed as UTC midnight. `TZ` is pinned so these hold on any machine. And for seeded
  rows: the epoch recognised while a real/absent timestamp is not, a seed-only store yielding
  **no** bounds to anchor to, one real entry anchoring them anyway, a seeded item flagged and
  headed without a date, and the user's own saved item keeping both its date and a clean line.
- **Browser-verified** in the running app (no runner is wired; see
  [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md), harness = ACTS-92). Exercised against
  real store data injected into `localStorage`: the nav entry in the desktop rail **and** the
  mobile drawer; Everything vs. Date range; narrowing to one month recomputing every count
  correctly; a backwards range showing the error **and disabling both buttons**; an empty
  window doing the same with its own message; the prompt section opening, editing, flowing
  into the produced file, and Reset restoring the default; and the **actual downloaded blob**
  captured and read back (`text/markdown`, `oravia-journey-2026-09-04.md`) to confirm the
  document the user gets. Then, for the catch-up window: the option **absent** with no stamp,
  appearing the moment a download stamps `last_export_at`, leading by default on the next load,
  and — with a reflection written the same evening as the export — counting **1** while
  Everything counted 2. Checked at 375px in both the two- and three-option layouts (the modes
  stack; no horizontal overflow). Finally, with an empty journal the label reads "Everything —
  Your whole journey" (not a 2023 date), one real entry anchors it to that entry's day, and the
  downloaded file shows the four seeded items headed by name and flagged.
- **Not browser-verified:** the clipboard write. `navigator.clipboard` is unavailable to an
  unfocused document in the automation pane (`Document is not focused`), so **Copy to
  clipboard needs a human tap on a phone** — the code path is the same `writeText` +
  toast + fallback-toast used by `ShareDialog` (ACTS-94), and the document it copies is the
  byte-identical string proven through the download path.
- **Gates:** `tsc --noEmit` clean · `vite build` clean · the other three harnesses still green
  (richtext 33/33, liturgical 19/19, verify-merge PASS) · **zero lint errors** in the six
  touched/new files.
