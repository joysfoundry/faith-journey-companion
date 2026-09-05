# Session — ACTS-157: export the journey for AI insights

_Wrapped 2026-09-04. Stories touched: **ACTS-157** (filed → Done). One sitting, filed and
shipped end to end._

## What happened (in order)

1. **Filed ACTS-157** from JC's ask: a menu item that exports a file you can paste into
   ChatGPT or Claude to generate insights and patterns, with the prompt written into the
   document, and a choice of *start-to-current* or a date range. Checked for duplicates
   first — the nearest neighbour is **ACTS-113** (*Insights + Wisdom*, To Do), which is the
   **in-app, grounded** version of the same value. This is deliberately the near-term path
   with **no AI in the product**; 113 stays open. Three decisions taken with JC before any
   code: **all four layers**, **its own nav entry**, **both** download and clipboard.

2. **Built the builder + the screen.** `src/lib/prayer/journeyExport.ts` is pure over `db`
   and read-only; `src/routes/export.tsx` is the screen (range · prompt · summary · privacy
   · buttons); **Export journey** joins the secondary nav beside Add prayers. Reflection
   links resolve through the existing `resolveInspiration`, so the file names sources
   instead of ids, and ACTS-156's markdown-lite marks pass through untouched — they were
   already valid markdown.

3. **Made the prompt editable in the app** rather than asking JC to review it as text. It
   sits in a collapsed section with a Reset button, so its wording is tuned *by use*. It
   carries the guardrail the PRD is explicit about: name patterns and ask questions, never
   speak for God or hand down discernment.

4. **JC asked for "since last export".** Added it as a third range that leads when it
   exists. Stamped in `settings.last_export_at` (additive, **no `STORAGE_KEY` bump**) only
   when the file is actually **taken** — copied or downloaded — never by opening the page.
   The window opens **on** the day of that export, not the day after: ranges are
   date-granular, so exporting Thursday morning and journaling Thursday night would
   otherwise lose the entry.

5. **That option exposed a real bug in the first cut** (below), which turned out to have a
   larger version underneath it affecting every layer.

6. **JC asked to anchor the "Everything" label to their own entries**, after it read
   "2023-12-31 to today" on an empty journal.

7. `/save` → two commits; the in-sandbox push failed on the usual git-auth error and **JC
   pushed from their own client**. Then `/done` + `/wrap` (this file).

## ⚠️ Worth remembering

**The store writes `created_at` in UTC, so `iso.slice(0, 10)` is the wrong day.** Filing by
the sliced string put a reflection journaled at 8pm Pacific under *tomorrow* — out of step
with every date the app displays and outside a date range the user picked ending that day.
It surfaced through the catch-up window: an evening export stamped the next UTC day, so the
window opened **in the future**, the exact gap the day-overlap was designed to prevent.
`dayOf()` now converts to the **local** calendar day, and leaves an already-plain date
(`MassExperience.date`, `KnowledgeItem.start_date`) as written rather than re-parsing it as
UTC midnight and shifting it a day backwards. This is the trap `todayISO()` already
documents in `compiler.ts` — **any future feature that filters by day inherits it.**

**`quoteBody()` falls back to `title`**, so every book printed its own title back as a
blockquote. Guarded with `isQuote()`. A quote was also headed by a 57-character snippet of
the text printed beneath it — `contentTitle()` does that by design for the library UI, but
it reads as duplication in a document.

**The seed has a single sentinel: `now = "2024-01-01T00:00:00.000Z"`, on all 48
pre-installed records.** Now exported as **`SEED_EPOCH`**. A real
`new Date().toISOString()` can never equal it, so an exact match is a reliable "this came
with the app" test — no id-prefix guessing. Used to keep seeded rows out of
`journeyDateBounds`, and to flag them in the document rather than dropping them: someone may
genuinely be working through the pre-installed *Bible in a Year*, and a user's edits never
change `created_at`, so date-filtering would have dropped a touched one too.

**Three bugs, all found by verifying rather than by reading.** The harness (57 checks) and
the browser pass each caught things the code review in my own head did not. Capturing the
**actual download blob** and reading it back — rather than trusting the builder's unit
tests — is what surfaced the book-title-as-quotation bug.

## Verified

Harness **57/57** (`npx tsx scripts/verify-journey-export.ts`, `TZ` pinned so the local-day
assertions hold anywhere) · browser-verified end to end including the real downloaded file ·
`tsc` clean · `vite build` clean · richtext 33/33, liturgical 19/19, verify-merge PASS ·
zero lint errors across six touched files.

**Not verified:** Copy to clipboard (the automation pane can't focus the document, so
`navigator.clipboard` refuses) — same path `ShareDialog` has used since ACTS-94, wanting one
human tap. And no real export has been run through an assistant yet, so the document is
proven *correct* but the prompt is unproven *in use*.

## Git state

`8c85d7e` (code + harness) and `8521c31` (story docs) on `origin/main`. The closing docs
(this summary, the final handoff, pointer/board/ledger) are a further commit.

## Next

**ACTS-157 is Done.** Left to try, not blocking: tap Copy on a phone; run a real export
through ChatGPT or Claude and judge the prompt in use. Whatever shape that reveals feeds
**ACTS-113** (in-app Insights → Wisdom), which this story deliberately left open.

Ahead of it in the queue, unchanged: the palette/dark-mode pair (**ACTS-151**, **ACTS-150**),
then roadmap item 4 (Reflection page tabs). **ACTS-92** (real test runner) remains deferred.
