---
id: ACTS-171
title: "Quick-add a link to Vessels — paste an Instagram/web URL and auto-fill the item"
spine: ACTS-171
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137]
started_at: 2026-09-07T18:20:22-0700
updated:    2026-09-07T20:42:26-0700
latest_handoff: ACTS-171/session-02.md
sessions: 2
---

## Goal
As someone who finds a devotional post on Instagram or an article on the web, I want to
**paste the link once** and have Oravia fill in the rest — title, category, platform, and the
Vessel it belongs to — so saving something I want to come back to is one paste and a confirm,
not a form.

## Context
Scoped down from the original "Send to Oravia" plan. Web Share Target (Android manifest + SW
POST) and real photo storage are **deferred** (Phase B/C, not filed) — iOS PWAs don't support
share targets anyway, so the highest-value, lowest-cost slice is a smart **quick-add by URL**
inside the existing Vessels Add flow.

**Why this is cheap — the smart logic already exists, it's just not wired into Add:**
- `detectPlatform(url)` → platform (already used in the Add flow's channel field).
- `identityFromUrl(url)` / `matchVoice(url, voices)` (`src/lib/prayer/knowledge.ts:192,233`) →
  match a pasted post back to a **Vessel the user already follows** (handle-based).
- `detectCategory` + `voiceFromLink` / `createVoiceFromUrl` — already wired in the *edit*
  route `src/routes/knowledge.$knowledgeId.tsx:42,124,130`, just **not** in Add.
- `fetchLinkPreview` (to build) — a thin extension of the existing server function
  `fetchSourceText` (`src/lib/prayer/fetchSource.functions.ts`) that returns OG/oEmbed
  `{ title, description, siteName, imageUrl }` best-effort.

**What's clumsy today (the gap this closes):** in `/formation` → Add
(`src/components/knowledge/VoiceEditor.tsx`), a pasted URL alone saves nothing — Title is a
required hand-typed field (`VoiceEditor.tsx:331` disables the button), category never
auto-detects (defaults to "post"), and the post is **not** auto-attributed to an existing
Vessel. So "save this IG link" is a multi-field chore.

## The plan
1. **`fetchLinkPreview(url)`** — extend `fetchSource.functions.ts`: parse OG/Twitter/oEmbed
   tags → `{ title, description, siteName, imageUrl, platform }`. Best-effort; degrades to the
   raw link (Instagram is login-walled — never block the save on a failed fetch). Add a
   scheme + private/loopback-host **SSRF guard** before fetching (the endpoint fetches
   user-supplied URLs).
2. **A "Paste a link" quick-add** in the Vessels Add flow (`VoiceEditor.tsx`, and/or a small
   entry on the `/formation` Add tab): one URL field →
   - `detectPlatform` + `detectCategory` set platform/category,
   - `fetchLinkPreview` pre-fills the title (editable, no longer a blocking chore),
   - **`matchVoice(url, voices)`** auto-attributes to an existing Vessel when the handle
     matches; otherwise offers "New Vessel from @handle" (reuse `createVoiceFromUrl`) or
     "unattributed",
   - one confirm saves the `KnowledgeItem` (+ its `links:[{platform,url}]`).
3. Optional "Pin to Home" on save (reuse `KnowledgeItem.pinned`, ACTS-137).

## Non-goals (explicitly out)
- Web Share Target / manifest `share_target` / SW POST handling (Android-only; deferred).
- iOS Share Sheet Shortcut (deferred).
- Photo upload / storage bucket (deferred; needs backend infra).
- Routing a link into a **Reflection** (the `/capture` two-destination screen) — only Vessels
  here. Revisit if wanted later.

## Acceptance criteria
- [x] Pasting an Instagram URL into the quick-add and confirming saves a `KnowledgeItem`
      (`category: "post"`, `links:[{platform:"instagram", url}]`) with **no hand-typed title
      required** (title pre-filled, still editable). _Verified in browser._
- [x] When the handle matches a Vessel already followed, the item is auto-attributed
      (`voice_id`/`channel_id` set) via `matchVoice`. _Verified: a post + the profile both
      matched the existing `@ascensionpress` Vessel._
- [x] When no match, the user can make a new Vessel from the link or save it unattributed.
      _Verified: new Vessel created with its channel; "No vessel (General)" option present._
- [~] A web article URL (non-social) saves as `article` with the OG title/site pre-filled.
      _Code path is identical (detectCategory → "article", same enrichment); not yet saved
      end-to-end in the browser — quick follow-up check._
- [~] `fetchLinkPreview` degrades gracefully (raw link kept) when the fetch fails/blocks, and
      rejects non-http(s)/private hosts. _Degrade path coded + title falls back; SSRF guard
      coded but not runtime-tested against a private host._
- [x] `tsc --noEmit` clean.

## Outcome — DONE 2026-09-07
Shipped and browser-verified across two sessions (see [session-01](ACTS-171/session-01.md),
[session-02](ACTS-171/session-02.md)). Beyond the original quick-add, session 02 landed the
**Vessel = person / Channel = its name-or-@username** model: the account's profile URL becomes
the Channel so repeat posts auto-attribute, and `VoiceEditor` channel rows gained a name field.
Commits `b70743e`, `1e4e9f3`, `34b46fb` (+ docs) — pushed.

## Deferred (not blocking — closed here, revisit if wanted)
- Non-social **article** save end-to-end + a runtime **SSRF-guard** check
  (`http://localhost` / `169.254.169.254` rejected).
- The documented **tests** (Vitest for `fetchLinkPreview` parsing + `extractAuthor` + guard;
  Testing Library for the quick-add attribution/naming paths).
- A `?url=` deep-link entry (cheap groundwork toward the deferred iOS Shortcut).
- Phase B (Web Share Target + iOS Shortcut) and Phase C (real photo storage) — not filed.

## Tests
_Convention ACTS-91._
- **Unit** (Vitest — `src/lib/**`): `fetchLinkPreview` OG/oEmbed parsing + SSRF guard;
  regression-lock `detectPlatform`/`identityFromUrl`/`matchVoice` on IG reel / website /
  YouTube URLs.
- **Integration** (Testing Library): render the quick-add with a seeded Vessel whose IG
  handle matches → paste that reel URL → confirm → assert a `post` `KnowledgeItem` with
  `voice_id` set; and a non-matching URL → "new Vessel" / unattributed path.
- **E2E** (Playwright — see the plan): paste link → preview → save → item appears in the
  `/formation` Library.
