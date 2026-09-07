---
id: ACTS-169
title: Purge journaled reflections from follow-along links shared before the allowlist fix
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-94, ACTS-108, ACTS-156, ACTS-138]
started_at: 2026-09-07T16:02:26-0700
updated:    2026-09-07T16:02:26-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone who shared a prayer session so others could follow along, I want to be sure the
link never carried my **private writing**, so that a reflection I journaled during that
session was not published to everyone who has the link — including people it was passed on
to.

## Context
Found while building Open Prayer (ACTS-108, 2026-09-07). `toShareItem` in
`src/lib/prayer/share.ts` said it kept "nothing session-local or identifying" but copied the
session item's `configuration` **wholesale**. For a `reflection` step that object holds
`response` — the text the user wrote — and `reflection_id`. So sharing a Lectio session you
had journaled in published your journal entry inside the payload.

**Already fixed going forward** (commit on 2026-09-07): `toShareItem` now uses an allowlist
of the keys the guest view actually renders (`decade`, `heading`, `presentation`, `fruit`,
`scripture_text`, `external_options`, `segment_labels`), so a new private key is private by
default. **This story is only about the links already out there.**

### Where an old payload can be sitting
1. **Supabase `public.shared_sessions`** — short slug links (`/follow/<slug>`), the
   `payload` column holding the lz-string-compressed `SharePayload` (see
   `shareStore.ts`, ACTS-94). These we can reach and rewrite.
2. **Fragment links** — the whole payload is encoded in the URL itself. Anyone holding one
   has the data; **nothing server-side can recall it.** The only honest mitigation is
   telling the sharer.

Scope is small in practice — the beta is a handful of testers — but the fix should not
depend on that being true.

## Acceptance criteria
- [ ] Audit `shared_sessions`: how many stored payloads decode to items carrying
      `configuration.response` / `reflection_id` (a read-only count first, before any write)
- [ ] Purge the private keys from affected stored payloads — re-encode through the same
      allowlist rather than hand-editing JSON, so one code path defines what is shareable
- [ ] Guests keep working: a purged link still renders its devotion (scripture, mysteries,
      external links) — only the sharer's own writing disappears
- [ ] Decide and record what to tell the sharer about **fragment** links, which cannot be
      recalled (JC's call: notify testers, or accept the exposure given beta scale)
- [ ] Add a regression guard so a private `configuration` key can never travel again —
      ideally a test asserting `toShareItem` drops an unknown key rather than passing it
- [ ] STORAGE_KEY bump not expected (no local data-shape change)

## Tests
- **Unit** (Vitest — `src/lib/prayer/share.ts`): `toShareItem` drops `response`,
  `reflection_id`, `open_prayer`, and any unknown key, while keeping each allowlisted one;
  round-trip `encodeShare`/`decodeShare` on a purged payload.
- **Integration**: the guest `/follow` view of a purged payload still renders the devotion
  and shows no reflection text.
- **E2E**: share a Lectio session with a saved reflection → open the link as a guest →
  the reflection is absent. Feeds the share flow in `docs/E2E-TEST-PLAN.md`.

## Notes
No migration is needed for the *table*; this is a data-cleanup task plus a guard. Treat the
audit read and the purge write as separate, confirmed steps — the second is an external
write to JC's Supabase, and it rewrites rows that other people may currently be reading.
