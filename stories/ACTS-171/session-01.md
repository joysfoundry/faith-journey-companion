---
story: ACTS-171
session: 01
wrapped_at: 2026-09-07T19:05:00-0700
status: In Progress
final: false
---

## What happened
Built the smart quick-add-by-URL for Vessels (scoped down from the "Send to Oravia" plan;
share target + photo storage stay deferred).
- `fetchLinkPreview` server fn in `src/lib/prayer/fetchSource.functions.ts` — OG/Twitter/
  `<title>` metadata, best-effort, with an SSRF guard (`guardPreviewUrl`) and decimal + hex
  HTML-entity decoding (`decodeEntities`/`codePoint`).
- `src/components/knowledge/QuickAddLink.tsx` — paste a link → staged preview (editable
  title, category, attribution, Pin) → one confirm saves the `KnowledgeItem`. Reuses
  `detectPlatform`/`detectCategory`/`matchVoice`/`voiceFromLink` from `knowledge.ts`.
- Wired above the manual `VoiceEditor` on the `/formation` Add tab, under an "or add by
  hand" divider.

## Verified (and how)
Browser (dev on :8080, beta gate key `acts-beta-unlocked-v1="1"`):
- Pasted `instagram.com/ascensionpress/` → OG title fetched, category auto = Post, saved a
  `post` KnowledgeItem + a new `@ascensionpress` Vessel with its IG channel.
- Pasted a post from that account → **auto-attributed** to the existing `@ascensionpress`
  Vessel ("Saving to @ascensionpress"). Profile re-lookup matched it too.
- Hex-entity fix confirmed: title renders `•` (was `&#x2022;`).
- `tsc --noEmit` clean.
- Cleaned all test data via the app's own delete (a direct localStorage edit got clobbered
  by the running store re-persisting — deleted through the UI instead). Back to seeded state
  (4 items, 7 voices).

## Git state at handoff
Committed & **not pushed** (JC to push, per workflow):
- `b70743e` ACTS-171 feature code (fetchLinkPreview + QuickAddLink + formation wire-in)
- `405f670` ACTS-172 devotion-block title fix
- `3a25245` docs: file ACTS-171 + ACTS-172
Story-docs commit for this handoff pending. JC's pre-existing edits (invite.html, about.tsx,
ACTS-162.md, 0003_feedback.sql migration) left untouched throughout.

## Next
See "Still open" in the pointer: non-social article save + SSRF runtime check, then the
documented tests, then optional `?url=` deep-link groundwork.
