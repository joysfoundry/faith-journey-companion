---
story: ACTS-157
session: 01
wrapped_at: 2026-09-04T23:10:00-0700
status: Done
final: true
---

## What happened
Filed and shipped in one session: **export the journey as one file you can paste into
ChatGPT or Claude to look for patterns**, with the prompt already written into it. All
eleven acceptance criteria are met.

**Why it isn't ACTS-113.** The in-app version — grounded Insights feeding user-named
Wisdom with evidence links — stays open as the future longitudinal feature. This ships the
value now with **no AI in the product at all**: it hands the user their own record and lets
them run it in the assistant they already have.

**New code.**
- `src/lib/prayer/journeyExport.ts` — the builder. Pure over `db`, read-only, never
  mutates the store. `DEFAULT_INSIGHT_PROMPT`, `buildJourneyExport`, `sinceLastExport`,
  `journeyDateBounds`, `isSeeded`.
- `src/routes/export.tsx` — the screen (range · prompt · summary · privacy · buttons).
- `nav-links.ts` — **Export journey** (`FileDown`), next to Add prayers: the import and
  the export sit together.
- `settings.last_export_at?: string` — additive; **no `STORAGE_KEY` bump** (store stayed
  on `prayer-companion-db-v39`).
- `SEED_EPOCH` exported from `seed.ts` (the constant was already there as a private `now`).
- `scripts/verify-journey-export.ts` — new unit harness, plain `npx tsx`.

**The document.** Prompt header → a context block (counts, how things were dated, what is
*not* here) → the journey in sections, each oldest → newest: reflections and journal,
prayers and devotions prayed, intentions, Mass, reading and study. Links resolve through
the existing `resolveInspiration`, so it reads "Written after: Introduction to the Devout
Life — St. Francis de Sales" and never an id. ACTS-156's markdown-lite marks pass straight
through — they were already valid markdown.

**Decisions taken with JC.**
- **All four layers**, **its own nav entry**, **both** download and clipboard — chosen at
  filing, before any code.
- **The prompt is editable in the app** (collapsed section, textarea, Reset), so its
  wording can be iterated by use rather than guessed at. It carries the guardrail the PRD
  is explicit about: *name patterns and ask questions, never speak for God or tell me what
  to decide.*
- **Three ranges**, after JC asked for a catch-up option: **Since last export** · Everything
  · a custom window. The catch-up window opens **on** the day of the last export, not the
  day after — ranges are date-granular, so exporting Thursday morning and journaling
  Thursday night would otherwise lose that entry; overlapping re-sends a few at most, and
  the screen says so. It is stamped **only when the file is actually taken** (copied or
  downloaded), never by opening the page, or a later catch-up could skip entries the user
  never received.
- **Size is shown, not capped** — "About N words", with a warning past `OVERSIZE_CHARS`
  (200k ≈ 50k tokens) that it may not paste into one chat.
- **Nothing is silently dropped.** Photos and audio are named as inexportable; common
  prayer texts are excluded on purpose and the document says why (the Church's words, not
  the user's).
- **The privacy line sits directly above the buttons** — built on the device, Oravia sends
  it nowhere, but pasting hands it to that company's servers under their terms. Framed as
  the user's call, not a warning to click past.

## ⚠️ Three bugs, all found by verifying rather than by reading
1. **UTC day slicing (the serious one).** Days were taken as `iso.slice(0, 10)`, but the
   store writes `created_at` in **UTC**. A reflection journaled at 8pm Pacific filed under
   *tomorrow* — out of step with every date the app displays, and outside a date range the
   user picked ending that day. It surfaced through the new option: an evening export
   stamped the next UTC day, so the catch-up window opened **in the future**, the exact gap
   the day-overlap was designed to prevent (seen live: stamp `2026-09-05T05:48:23Z`
   rendering a window from `2026-09-05` while the app's own today was `2026-09-04`).
   `dayOf()` now converts to the **local** calendar day, and returns an already-plain date
   (`MassExperience.date`, `KnowledgeItem.start_date`) as written rather than re-parsing it
   as UTC midnight and shifting it a day backwards. This is the trap `todayISO()` documents
   in `compiler.ts`.
2. **`quoteBody()` falls back to `title`** "for legacy safety" — so **every book printed its
   own title back as a blockquote** under its own heading. Guarded with `isQuote()`.
3. **A quote was headed by a 57-character snippet of the very text printed beneath it**
   (`contentTitle()` does that by design for the library UI). Now headed simply "Quote".

## Anchored to the user's own entries
With an empty journal the label read **"Everything — 2023-12-31 to today"**: every seeded
row carries `now = "2024-01-01T00:00:00.000Z"` (UTC midnight → Dec 31 Pacific), so a
brand-new user was told their journey began before they installed the app.

That constant is now exported as **`SEED_EPOCH`** — one sentinel across all 48 pre-installed
records, and a real `new Date().toISOString()` can never equal it, so an exact match is a
reliable "this came with the app" test. No id-prefix guessing. `journeyDateBounds` counts
**only the user's own rows**, so an untouched install reads "Everything — Your whole
journey".

Seeded library items are **kept, not dropped** — someone may genuinely be working through
the pre-installed *Bible in a Year* — but are **headed by name alone** (their only date is
the install stamp) and **flagged "came with the app, not chosen"**, so an assistant can
never read them as evidence of what this person was drawn to. Rejected: dropping them
(loses a program in real use) and date-filtering them out (would drop a *touched* one too,
since a user's edits never change `created_at`).

## Verified (and how)
- **Unit — `scripts/verify-journey-export.ts`, 57/57 green** (`npx tsx
  scripts/verify-journey-export.ts`; the plain-tsx convention of ACTS-155/156, not the
  deferred Vitest runner of ACTS-92). Both range boundaries inclusive; a day past an entry
  excluded; open-ended windows both directions; empty window and empty store; oldest→newest
  ordering; links resolved with **no raw id leaking**; an external-app session; a Mass filed
  by `date` not `created_at`; a book filed by `start_date`; markdown-lite passing through;
  photos named; a pasted passage carried as a quote; the prompt appearing **exactly once**;
  a custom prompt fully replacing the default; the "never speak for God" guardrail present;
  both filename shapes; the two quote regressions; the catch-up window (no stamp → no
  window, opens on the day, **an evening export does not open it in the future**, a
  same-day entry still caught, a re-export narrowing to today); local-day filing (an
  8pm-Pacific entry on the local day and **not** the next UTC day, a plain date never
  re-parsed); and the seeded rows (epoch recognised, a seed-only store yielding no bounds,
  one real entry anchoring them, seeded items flagged and dateless, the user's own keeping
  its date). **`TZ` is pinned to `America/Los_Angeles`** so the local-day assertions mean
  something on any machine.
- **Browser-verified** in the running app against real store data (no runner is wired; see
  [`docs/E2E-TEST-PLAN.md`](../../docs/E2E-TEST-PLAN.md), harness = ACTS-92). The nav entry
  in the desktop rail **and** the mobile drawer; all three range modes; narrowing to one
  month recomputing every count; a backwards range showing the error **and disabling both
  buttons**; an empty window doing the same with its own message; the prompt section
  opening, editing, flowing into the produced file, and Reset restoring the default. The
  **actual downloaded blob was captured and read back** (`text/markdown`,
  `oravia-journey-2026-09-04.md`) to confirm the document the user receives — that is how
  the seeded-item flag and the quote fixes were confirmed. With a reflection written the
  same evening as an export, **Since last export counted 1 while Everything counted 2**.
  Empty journal → "Everything — Your whole journey"; one entry → anchored to that day.
  Checked at 375px in both the two- and three-option layouts: the modes stack, no
  horizontal overflow.
- **Gates:** `tsc --noEmit` clean · `vite build` clean · the other three harnesses still
  green (richtext 33/33, liturgical 19/19, verify-merge PASS) · **zero lint errors** across
  all six touched/new files.

## Not verified — carry into the next sitting
- **Copy to clipboard needs one human tap.** `navigator.clipboard` is unavailable to an
  unfocused document in the automation pane (`Document is not focused`), so the write path
  was never exercised end to end. It is the same `writeText` + toast + fallback-toast that
  `ShareDialog` has used since ACTS-94, and the string it copies is byte-identical to the
  one proven through the download path — but it wants a real tap on a phone.
- **The prompt wording has not had JC's pass.** It ships as a considered default and is
  editable in the app precisely so it can be judged in use.
- **No real export has been run through ChatGPT or Claude.** The document is verified as
  *correct*; whether the prompt actually produces useful insight is unproven.

## Git state at handoff
**Committed and pushed.** `8c85d7e` (code + harness) and `8521c31` (story docs) are both on
`origin/main` — the in-session push failed on the usual sandbox git-auth error and JC pushed
from their own client. This handoff's docs are a further commit.

## Next
Nothing blocking. When convenient: **tap Copy on a phone**, then **run a real export through
an assistant** and judge the prompt in use — editing it in the app is the intended way to
tune it. If a shape emerges from that, it feeds **ACTS-113** (in-app Insights → Wisdom),
which this story deliberately left open.
