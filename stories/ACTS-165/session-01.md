---
story: ACTS-165
session: 01
wrapped_at: 2026-09-05T17:02:45-0700
status: Done
final: true
---

## What happened

Straight after ACTS-164, JC read the About page and found the two middle sections holding
each other's content: **"More than a prayer app"** carried the faith-*learning* paragraph,
while **"One place for your journey"** carried all three prayer/devotion paragraphs. The
headings and the prose were arguing. Swapped, and each section rewritten to make its own
claim:

- **More than a prayer app** — opens on prayer taking more than one shape (your own words
  on some days, a devotion you were taught on others) and says Oravia **honors both**. The
  claim the heading is actually for is then made as a **contrast**, not a category label:
  the point is not that the app stores prayers but that it **digitizes them into one
  place**, which is what makes it possible to **customize a devotion the way you, your
  family, or your parish pray it** — compiled into a guided flow, and shareable.
- **One place for your journey** — the learning and hub paragraphs, **elevated past "good
  for me"**: one place is easy to hand on, so it encourages fellowship. Closes on "and the
  people walking with you are part of your journey too."

**Copy decisions, in the order JC made them:**

1. **The redundancy was "scattered → gathered" said twice.** ACTS-164's text described the
   dozen scattered places *and* the flipping between booklet, holy card and printout —
   the same beat, back to back. Said once now.
2. ⚠️ **Two good lines were nearly lost, and were caught only by comparing against the
   pre-edit file.** The guided-flow clause ("the right day, the right mysteries and
   readings, reflection as a first-class step, and a way to sing") and its closing line
   **"so the tool disappears and the prayer stays"** existed in `about.tsx` **only** —
   `invite.html` never had them — so a swap driven by the invite text dropped them
   silently. Both restored, and they now live in **both** files. The lesson for the next
   About edit: the two mirrors were *not* byte-identical before this story, so diff them
   before assuming one represents the other. They are much closer now.
3. **The scattered-sources list is gone for good** (JC): "a Rosary pamphlet, a hymnal, a
   holy card, a family novena someone texted you". The sentence was tightened to "those
   prayers are scattered across paper and apps" rather than left as a stub.
4. **"build" → "customize", personal → communal.** JC first asked for "the way your family
   or parish pray it", which left the list that follows ("your prayers, in your order,
   with your intentions") pulling the other way — the subject had gone communal while the
   possessives stayed personal. Flagged, and JC chose naming all three: **"the way you,
   your family, or your parish pray it"**, which resolves it without touching the list.

An intermediate two-paragraph variant was drafted at JC's request and then set aside; the
shipped shape is three paragraphs — persists / guides / shares.

## Verified (and how)

- **Rendered both pages** at desktop and 375×812 after each round, reading the full text
  back — `/about` is client-rendered, so `curl` proves nothing (ACTS-164's note).
- ⚠️ **`find` gave a false negative and briefly looked like a real bug.** Searching the
  rendered page for "the tool disappears and the prayer stays" returned **no matches**
  while the sentence was plainly on screen — `find` matches against **truncated**
  accessibility-tree lines, so a long sentence will not match. JC saw the same absence
  independently. **Use `get_page_text` to confirm copy; treat a `find` miss as no
  evidence, not as absence.**
- Both mirrors diffed section by section: same content, deliberately different
  contractions (`invite.html` contraction-free, `about.tsx` with them).
- `tsc --noEmit` clean; `vite build` clean, run after each round of edits.
- Prettier warnings in both files remain **pre-existing** (established in ACTS-164 against
  a stashed clean tree) and were left untouched.

## Git state at handoff

Committed **and pushed** — `d7c4c37` (copy, both files) + `0b49207` (story docs), plus
this handoff. ⚠️ `git push` **fails from this environment** (`could not read Username for
'https://github.com'` — no credentials); JC pushed from their own client, as in ACTS-164.

⚠️ **A concurrent session held ACTS-162 open during this story** and modified
`stories/ACTS-162.md`, `stories/README.md` and `docs/JIRA-BACKLOG.md` (status
To Do → In Progress) at 15:56. Those were deliberately left unstaged during `/save`. The
board and ledger rows for **this** story could not be added without also staging that
session's ACTS-162 status flip — the rows sit too close together to split the hunk — so
the close commit carries it, stated plainly rather than smuggled.

## Next

Story closed — all acceptance criteria met. Nothing outstanding for ACTS-165.

**For the next About edit:** `src/routes/about.tsx` and `public/invite.html` are mirrors
and change together (ACTS-164), but this story proved they can drift **content**, not just
voice — check both before assuming. A shared source is still a real refactor, not a
tidy-up. **ACTS-147** (PRD resync, folding the About framing into `docs/ACTS-PRD.md`) is
now further out of date than it was: the About page's central claim changed twice today.
