# Session summary — 2026-09-10

Quote↔source content (ACTS-183) → grew into the Bible model, scripture attribution, and a
"connect every entity" design direction. Touched **ACTS-183** and **ACTS-185**; filed
**186 / 187 / 188**.

## What happened (in order)

1. **ACTS-183 — tie a quote to its source content** (core): added generic
   `source_item_id` on `KnowledgeItem`; `QuoteSourcePicker` (pick existing / "Add as
   content"); reverse **"Quotes from this"** on any content page; `deleteKnowledgeItem`
   clears dangling links. Fill-if-empty author (bug caught live: don't clobber a free-text
   `creator`).
2. **Folded-in fix:** reflection launched from a quote now lights the **quote** icon, not
   the generic link icon (kind-aware `ReflectionComposer`).
3. **Attribution surfacing:** promote free-text `creator` → Vessel; **scripture quotes
   group by book** (`bibleBookName` + abbreviations); empty-name Voices hidden; **By Channel**
   dropped the "No channel" bucket; filter pills relabeled **Voices / Channel** (no "By").
4. **Bible model (JC-designed, iterated):** the Bible is **one book per translation**
   ("Bible — NABRE/NIV/…") + a version-less "Bible" (Unknown); **the linked book IS the
   version**; scripture quotes auto-link to the Settings translation; Bible books kept out of
   General. Store: `BIBLE_BOOK_ID`, `bibleVersionBookId`, `isBibleBookId`.
5. **ACTS-183 closed Done** — all 15 ACs verified.
6. **ACTS-185 — connected entity inputs** (Done, verified, then judged the wrong *approach*):
   reusable `EntitySuggestInput` typeahead; composer "From" → **auto-creates a Vessel**;
   book "source" → autocompletes content ("bi"→Bible) + links; removed the unclear "Make a
   Vessel" button; quote inspiration cards show voice + body (no bold title); composer
   scripture **Version picker** (defaults to Settings translation); citations spell out
   "Luke".
7. **Design principle captured** (JC): every entity-name box must autocomplete + **link**,
   never stray free-text — the app is about connecting *threads*. Saved to memory.
8. **Filed forward stories:** **ACTS-187** unified content add form (add-first, edit mirrors,
   one shared component — supersedes 185's bolt-on approach); **ACTS-186** app-wide sweep for
   stray text boxes (open); **ACTS-188** Settings checkboxes to choose which Bible versions
   show in book resources.
9. **Non-story data hygiene (JC's local store):** deleted 6 gibberish test quotes from
   General (kept 2 real); attributed "Pray, hope, and don't worry." to St. Padre Pio; left
   "The soul that trusts is happy." in General as a live test of the bucket.

## Verified (how)
Live in the running dev app (port 8080/8081), using background tabs and localStorage
inspection so JC's own session was never disturbed; test data + drafts restored after each
check. Confirmed: link fills source / preserves author; reverse listing; Add-as-content mint
+ delete-clears-link; reflection icon `aria-pressed`; promote-to-Vessel appears in Voices;
scripture Luke bucket; **Bible — NABRE** page lists its verse; version picker (10 options,
re-links on change); "bi → Bible" typeahead; From typeahead + Tab-accept; auto-Vessel on
save; inspiration cards voice+body. Typecheck (`tsc --noEmit`) clean throughout; no console
errors.

## Git state at handoff
**Committed, NOT pushed** — pushes failed **all session** on credentials
(`could not read Username for github.com`). **11 unpushed commits** on `main`
(`571683a` … `caebdab`). Working tree clean. **JC must `git push origin main`** from a git
client. No unsaved code.

## Parked / next
- **Push the 11 commits** (blocker: local git credentials).
- **ACTS-187** (unified add form) — the real redesign; well-scoped, open Qs listed (scope,
  which fields are "later", fold in paste-a-link?).
- **ACTS-186** (threads sweep) — open; audit stray text boxes.
- **ACTS-188** (Settings Bible-version toggles) — open Qs: default all vs Catholic core;
  filter the version picker too; toggle the Unknown "Bible".
- **Deferred, unfiled:** paste-a-link from a quote's source ("icon next to the others").
- **Still open (JC):** the broader **Vessel vs Voice** umbrella concept.
- **Minor:** the version-less "Bible" (Unknown) carries a leftover USCCB link; non-NABRE
  reader links open Genesis 1 on Bible Gateway.

## Next session — opener (paste to start)
> Resuming faith-journey-companion. ACTS-183 and ACTS-185 are **Done** (verified) but the
> session's **11 commits never pushed** (git credentials) — I'll `git push origin main`
> myself; confirm it's clean. Then let's start **ACTS-187** (unified content add form:
> one shared add/edit component, add-first, edit mirrors, entity-matching baked in) —
> run `/start ACTS-187`. Also open: **ACTS-186** (app-wide stray-text-box sweep) and
> **ACTS-188** (Settings checkboxes for which Bible versions show). Design principle to
> honor throughout: every entity-name box autocompletes + links to an existing
> Vessel/content — never stray free text (see the `connected-entity-inputs` memory).
