---
story: ACTS-177
session: 01
wrapped_at: 2026-09-09T16:45:32-0700
status: Done
final: true
---

## What happened
Unified the two "put it on Home" mechanisms into one **`pinned`** concept, end to end,
and shipped one **📌 Pin to Home** control everywhere. Before: content used a pushpin
(`pinned`), while channels and content-links used a ☆ star (`favorite`) — same intent,
two verbs, two icons (JC: "I can only pin the imported video not the channel").

- **types** ([types.ts](../../src/lib/prayer/types.ts)): added `pinned` to `Channel`
  and `KnowledgeLink`; `favorite` kept but **repurposed/reserved** for a future
  favorite/sort-to-top feature (JC's later refinement: pinning = Home, favoriting =
  sort to top of a list, like the Prayers library) — not deleted.
- **store** ([store.ts](../../src/lib/prayer/store.ts)): a non-destructive
  `favorite → pinned` migration folded into the load normalizers (`normalizeLinks`,
  `normalizeVoice`, `voiceFromLegacyItem`, `normalizeContent`), prefer new field,
  fall back to legacy — **no `STORAGE_KEY` bump, no reset, no pin lost**. Mutations
  renamed `toggleChannelPin` / `toggleContentLinkPin`.
- **latent bug fixed**: `normalizeContent` was **dropping item-level `pinned`** on every
  load (ACTS-137) — now preserved.
- **read side**: `pinnedLinks` + primary-link helpers ([knowledge.ts](../../src/lib/prayer/knowledge.ts))
  and [inspiration.ts](../../src/lib/prayer/inspiration.ts) read `pinned`.
- **seed**: USCCB/Hallow channels + the Amazon link seeded as `pinned`.
- **UI**: ☆ → 📌 "Pin to Home"/"Unpin from Home" in formation, voice detail, knowledge
  detail, and VoiceEditor.

**Decision (JC):** true data-level unification, not UI-only — "I want the code to be
clean." Done via load migration, not a destructive reset.

## Verified (and how)
Browser (localhost:8080): after load, stored channels carried `pinned:true` with
`favorite` gone (USCCB/Hallow migrated); DOM showed 5 "Unpin from Home" + 9 "Pin to
Home"; Home Vessels card surfaced the pinned channels + links (USCCB, Hallow, Why We're
Catholic, 9 Things). Channel chips rendered filled pushpins for pinned. `tsc --noEmit`
clean. (Stale `toggleChannelFavorite is not defined` console errors were mid-edit HMR
bundles — source has zero old refs.)

## Git state at handoff
Committed to `main`, **push from this env fails** (`could not read Username`) → JC pushes.
Code `48ce906`, docs `e1b0bd0`. (Both browser-verified before commit.)

## Next
Done. Follow-on: the **favorite/sort-to-top** feature (the now-reserved `favorite` field)
— its own story when wanted; overlaps ACTS-179 (filters). See [[current-roadmap]].
