---
id: ACTS-193
title: Tighten the Journal — sane "Source" grouping + contain overflowing text
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-135, ACTS-140, ACTS-181, ACTS-191]
started_at: 2026-09-11T11:12:42-0700
updated:    2026-09-11T11:12:42-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone reviewing my journal, I want **Group by → Source** to bucket entries by a real
**source/provenance** (Scripture, a Vessel, a session…), not by the raw text of the inspiration —
and I want long text to **stay inside its box**. Tighten up the Reflection Journal.

JC (2026-09-11):
> Figure out what the source should be when you click on Journal. Is it provenance? Is it links?
> What if there are no links? In the screenshot these are all scripture-inspired entries, but the
> group is the link text — don't think that's what it should be. Also the text runs out of the box
> when you click an entry. Tighten up reflection.

## Context — root causes (already traced)
- **Grouping keys on the display label, not the source.** `itemSourceKeys`
  (`src/routes/reflections.tsx`) returns `entry.links.map(l => resolveInspiration(l, db).label)`.
  For a `learning` link to a **scripture quote**, `resolveInspiration`
  (`src/lib/prayer/inspiration.ts`) sets `label = item.title || link.label` — but a quote's
  `title` is empty, so it falls back to the **link label, which was set to the quote body text**.
  So each scripture-inspired entry becomes its own group ("love is patient", "the greatest is
  love", …) instead of grouping under one real source. The actual source signal —
  `scripture_ref` / "Scripture" — already sits in the resolved `detail`, unused for grouping.
- **Overflow.** Long unbroken strings (e.g. pasted gibberish) run past the entry dialog and the
  inspiration cards — no wrapping/containment. Needs `break-words` / `overflow-wrap: anywhere` +
  `min-w-0` on flex children, and the dialog body should wrap/scroll, never widen.

## Acceptance criteria
- [ ] **Group by Source** buckets by a coherent source, decided per the taxonomy below — scripture-
      inspired entries land together (e.g. under "Scripture" or their book), **not** under the
      quote body text.
- [ ] Entries with **no links** fall under a single, clearly-named catch-all (today "No source").
- [ ] An entry inspired by several sources appears under each (keep current multi-key behavior),
      deduped.
- [ ] Long unbroken text is **contained** in the entry dialog and every inspiration card — wraps,
      never overflows the box or the viewport; the dialog scrolls if tall.
- [ ] (Consider) the same source label is what shows on the inspiration card heading, so grouping
      and card stay consistent (a scripture card should read "Scripture · <ref>", not body-as-title).

## Open questions for JC (the "what is the source?" decision)
- **Scripture granularity:** one "Scripture" bucket for all, or per book ("1 Corinthians"), or per
  passage ("1 Corinthians 13:4-13")? (Recommend: per book, so a passage's sittings stay together
  yet Genesis ≠ Corinthians.)
- **Source taxonomy per link type:** scripture quote → Scripture/book; other quote → its Vessel
  (else creator/source); `prayer_session` → the devotion; `daily_reading` → "Word"; `mass` →
  "Mass"; `passage`/`link` → their label. Confirm.
- **No-link name:** "No source" vs "Free writing" vs "Untagged" (Theme view already uses
  "Untagged").

## Tests
No runner yet (ACTS-92). **Unit:** a `sourceKeyFor(link, db)` helper (scripture→book, quote→vessel,
session→devotion, none→catch-all). **Integration:** Journal "Group by Source" buckets scripture
entries together; long text stays within the dialog/cards. **E2E:** open a long entry → no
horizontal overflow. Planned.
