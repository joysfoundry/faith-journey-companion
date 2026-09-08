---
id: ACTS-171
title: "Quick-add a link to Vessels — paste an Instagram/web URL and auto-fill the item"
spine: ACTS-171
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137]
started_at: 2026-09-07T18:20:22-0700
updated:    2026-09-07T18:41:00-0700
latest_handoff: null
sessions: 0
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
- [ ] Pasting `https://www.instagram.com/reel/…` into the quick-add and confirming saves a
      `KnowledgeItem` (`category: "post"`, `links:[{platform:"instagram", url}]`) with **no
      hand-typed title required** (title pre-filled, still editable).
- [ ] When the handle matches a Vessel already followed, the item is auto-attributed
      (`voice_id`/`channel_id` set) via `matchVoice`.
- [ ] When no match, the user can make a new Vessel from the link or save it unattributed.
- [ ] A web article URL (non-social) saves as `article` with the OG title/site pre-filled.
- [ ] `fetchLinkPreview` degrades gracefully (raw link kept) when the fetch fails/blocks, and
      rejects non-http(s) and private/loopback hosts.
- [ ] `tsc --noEmit` clean.

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
