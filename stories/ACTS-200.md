---
id: ACTS-200
title: Recognize a scripture verse by its wording (verse-text search → citation)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-196, ACTS-188, ACTS-183, ACTS-191]
started_at: 2026-09-12T11:11:14-0700
updated:    2026-09-12T11:11:14-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone pasting a passage as **just the verse words** (no reference), I want the app to recognize
the verse and **recommend its citation** — so "Blessed are the peacemakers…" suggests **Matthew
5:9** without me typing the reference. A future extension of [[ACTS-196]], which today can only read a
citation that already appears **in** the pasted text.

JC (2026-09-12): "It's a good feature for the future, especially if we obtain licensing."

## Why (the gap ACTS-196 leaves — by design)
ACTS-196's `inferReference` reads a `Book chapter:verse` string **out of** the pasted text; it
**cannot recognize a verse from its wording**, because the app stores no scripture text (local-first;
it deep-links out — see the Bible-app model). So a bare-verse paste falls to the "add a citation"
prompt. Recognizing the verse needs a **corpus of scripture text to match against**.

## Approaches (to design)
- **Curated known-verses table** (no licensing): a small, conservative map of distinctive phrases →
  citation (Beatitudes, John 3:16, Psalm 23, the Our Father, the Greatest Commandment…). On a
  no-reference paste, match a distinctive phrase → recommend. Partial but reliable and low-risk;
  keep it conservative to avoid wrong recommendations (JC values precise quotes).
- **Public-domain full-text search**: bundle a PD translation (KJV / Douay-Rheims) and fuzzy-match
  any pasted passage to its reference. Comprehensive but heavy (whole-Bible text) and cross-version
  wording differs ("shall"/"will", "children"/"sons"), so matching must tolerate paraphrase.
- **Licensed corpus** (the real unlock): **if/when we obtain licensing** for modern translations
  (NABRE/NIV/…), match against the reader's own version for accurate recognition — and this could
  also revisit the "show the official text beneath" idea that ACTS-196 ruled out on licensing.

## Open questions for JC
- Start with the curated table (quick win) and grow, or wait for a licensed/full corpus?
- Confidence bar for a text match (distinctive-phrase hit vs fuzzy whole-verse) so we never
  confidently recommend the wrong reference.
- Recommend inline (ACTS-196 nudge) and/or at save (ACTS-196 dialog) — reuse those surfaces.

## Tests
No runner yet (ACTS-92). **Unit:** a `recognizeVerse(text)` helper (distinctive phrase / fuzzy match
→ citation or none; no false-confident matches). **Integration:** a bare-verse paste recommends the
right citation via the ACTS-196 surfaces; an unknown passage still just prompts. **E2E:** paste
"Blessed are the peacemakers…" (no reference) → recommends Matthew 5:9 → accept → files under Matthew.
Planned.
