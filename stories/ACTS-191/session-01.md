---
story: ACTS-191
session: 01
wrapped_at: 2026-09-11T11:52:09-0700
status: Done
final: true
---

## What happened
Shipped the Word expanded page + Lectio Divina block and the scripture-quote thread.

- **`/word` is the expanded page** — Daily Readings (liturgical day + Mass capture) + reading
  Programs (via `WordSection`) **plus** a **"Begin Lectio Divina"** entry block (`word.tsx`). JC
  confirmed this is the fuller page (beyond the Home Word card).
- **Lectio block reused** — the seeded 4-movement session; the reader's **chosen** passage (not
  "today's") is **pinned at the top** (reference + pasted text + Open in your Bible) for reference
  across the movements (`session.$sessionId.tsx`).
- **Scripture-as-quote thread** — finishing a session with a chosen passage records a typed
  `scripture` quote. Reworked per JC into **one visible quote per passage, backend counts prayings**:
  `KnowledgeItem.touches[]` (`{kind:"prayed", session_id, at}`), dedup by `scriptureQuoteKey`
  (normalized citation + Bible version), load-time merge of pre-existing dupes, and the **same dedup
  in the reflection composer** (paste an existing passage → links, not duplicates). Quote detail
  shows "From this Lectio · <date>".
- **Bugs fixed in-flight:** `normalizeContent` was dropping a new KnowledgeItem field on load (see
  [[lectio-quote-thread]]); a UTC-day off-by-one in the provenance date. Journal Lectio row set
  date-first to match single entries.
- **Filed follow-ons:** ACTS-192 (session "completed on" vs scheduled date), ACTS-193 (Journal
  "Source" grouping + text overflow), ACTS-194 (version-aware scripture citation typeahead).

## Verified (and how)
- **In-app (dev :8081):** `/word` shows Daily Readings + Programs + the Lectio entry; the chosen
  passage pins atop the Lectio block; finishing mints a scripture quote with "From this Lectio".
- **Store inspection:** pre-existing 1 Cor 13 duplicate **merged to one** on load; a 2nd Lectio on
  the same passage kept **1 quote, touchCount 2**; a composer add of the same passage created **no**
  new quote and produced a **single** inspiration card.
- `npx tsc --noEmit` clean throughout.

## Git state at handoff
- All ACTS-191 code + docs **committed and on `origin/main`** (this session: `360223a`, `0408702`,
  `0512aca`, `9fd54c7`; plus the follow-on filings and the session summary). Local `origin/main`
  ref = `90d44cc`.
- This closing handoff + pointer/board flip to Done are a **new commit** — will need pushing from
  JC's git client (env has no git creds).

## Next
- **Deferred (not part of Done):** backfill of past Lectios' scripture into quotes; any further
  `/word` layout expansion beyond the current page — pick up under a new story if wanted.
- Acceptance criteria met (JC confirmed the expanded page + Lectio block). Story **Done**.
- Queued: ACTS-192 / 193 / 194 (To Do, each with open questions).
