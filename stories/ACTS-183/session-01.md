---
story: ACTS-183
session: 01
wrapped_at: 2026-09-10T12:01:15-0700
---

# ACTS-183 — session 01

## What happened

Built the core story **and** a large set of JC-directed follow-ons that grew out of it
(attribution + scripture/Bible modeling). All shipped behind the local-first store; no
`STORAGE_KEY` bump.

**Core (quote ↔ source content):**
- New generic `source_item_id?: ID` on `KnowledgeItem` (`types.ts`), normalized in the
  store, migrated with no reset.
- `QuoteSourcePicker` (new component) on the quote editor: searchable picker over all
  non-quote content; linking fills `source`/author **fill-if-empty** (never clobbers —
  "empty" = neither `voice_id` nor `creator`); **"Add as content"** mints an item in the
  right category and links it.
- Reverse **"Quotes from this"** on any content's detail page + a forward "From …" link on
  the quote. `deleteKnowledgeItem` clears dangling `source_item_id` (quote survives).

**Reflection icon fix (folded in):** a reflection launched from a quote now lights the
**quote** icon, not the generic "Link an item" icon (`ReflectionComposer` icon states are
kind-aware).

**Attribution surfacing (folded in):**
- **"Make '<name>' a Vessel"** promotes a free-text `creator` to a real Vessel.
- Filter pills relabeled **"Voices"** / **"Channel"** (dropped "By").
- **By Channel** drops the "No channel" bucket (only content on a channel shows).
- Empty-name "Untitled" Voices no longer render as groups.

**Scripture / Bible model (the big one, folded in):**
- Unattributed `scripture` quotes bucket **by book** ("Luke", subtitle "Book of the
  Bible") in the Voices view — `bibleBookName()` in `bible/apps.ts` resolves full names +
  common abbreviations ("Lk"→"Luke"). A quote with a **real** Voice keeps it (never leaves
  its Vessel); only unattributed ones bucket by book.
- **The Bible is one book per translation**: seeded "Bible — NABRE / NIV / ESV / NLT /
  NKJV / KJV / NASB / RSVCE / DRA" + a version-less "Bible" (Unknown), each with a reader
  link (NABRE→USCCB, else Bible Gateway). `store`: `BIBLE_BOOK_ID`, `bibleVersionBookId`,
  `isBibleBookId`. **The linked book IS the version** (no separate field).
- **Version picker** on scripture quotes (9 translations + Unknown), defaulting to the
  reader's **Settings translation** (`db.settings.bible_translation`, default NABRE);
  picking sets `source_item_id`. Existing scripture quotes auto-link to the default.
  Generic source picker hidden for scripture. Byline shows "— Lk 2:10 · NABRE".
- All Bible books kept **out of the General bucket** (`isBibleBookId`); they list under
  **Books**; verses live in the per-book buckets.

## Verified (how)

Live in the running app (port 8080, dev server; used the seeded quotes, restored seed data
after each destructive check):
- Link existing content → `source` filled, author **not** clobbered (a live test caught a
  first cut that overrode a free-text author; fixed). Reverse "Quotes from this" listed it.
- "Add as content" minted a `book`, carried the author, linked. Deleting the source cleared
  the dangling `source_item_id`; quote survived.
- Reflection-from-quote: `aria-pressed` → Add-a-quote `true`, Link-an-item `false`.
- Promote-to-Vessel: created the Vessel, appeared under Voices; reverted.
- Scripture: Luke bucket held the verse; **Bible — NABRE** page listed Lk 2:10; Version
  picker showed 10 options, changing to NABRE re-linked the quote. General excluded all
  Bible books (back to the 8 pre-existing junk quotes).
- Typecheck clean throughout; no console errors.

No automated test runner (ACTS-92 deferred) — planned unit/integration/E12 tests documented
in the pointer.

## Git state at handoff

**Committed, NOT pushed** — pushes failed all session on credentials
(`could not read Username for github.com`). **6 unpushed commits on `main`:**
`571683a`, `66508d3`, `68a3313`, `f727788`, `83ff77d`, `6d5ea97` (+ this handoff commit).
**JC must `git push origin main` from a git client.** Working tree otherwise clean; no
unsaved code.

## Next

1. **Push** the 6 (now 7) commits from JC's git client.
2. **Open questions JC raised, not yet decided:**
   - Whether the per-book "Luke" buckets should be **real Vessels** vs the current virtual
     grouping (JC leaned "book's author = book name"; left virtual).
   - The broader **Vessel vs Voice** umbrella concept ("a book is a vessel, programs…
     vessels of God's messages") — still being worked out.
3. **Data hygiene (JC's store):** General holds ~8 **junk test quotes** ("adsfggfgsdf" etc.)
   — offered to delete, awaiting the go-ahead. The seed "YOUCAT, Benedict XVI" creator
   conflates a book + person (worth fixing to "Benedict XVI").
4. **Small polish:** the version-less "Bible" (Unknown) still carries a leftover USCCB link
   from the earlier single-Bible approach (harmless). Non-NABRE reader links open Genesis 1
   in that version on Bible Gateway.
5. **Deferred spinoff:** paste-a-link-from-a-quote's-source (Add-Vessels parity) — JC:
   "an icon next to the others." Not filed as a story yet.
6. **Optional:** version picker on the two *other* scripture-creation surfaces
   (`ReflectionComposer` "Add a quote", `VoiceEditor` add form) — currently they create
   scripture quotes that auto-link to the default translation on next load, but have no
   inline picker.
