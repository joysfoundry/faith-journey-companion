---
id: ACTS-178
title: Paste-a-link — keep the person distinct from their channel; make kind correctable
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-171, ACTS-137, ACTS-177, ACTS-179, ACTS-180]
started_at: 2026-09-09T12:42:04-0700
updated:    2026-09-09T16:45:32-0700
latest_handoff: ACTS-178/session-01.md
sessions: 1
---

## Goal
As someone importing content by pasting a link, I want the **person/organization**
(the Vessel) kept separate from their **channel/show**, and the Vessel's **kind**
correctable, so that an individual is stored consistently no matter how they were
entered — instead of a video/show name becoming a fake "individual".

## Context (why)
Paste-a-link (`src/components/knowledge/QuickAddLink.tsx`) in **"new vessel"** mode
conflates three concepts. Importing Ana Munley's YouTube video produced:
- a **Vessel** named after the **channel/show** — "AfterMass with Ana Munley" —
  because `vesselNamePrefill` uses the YouTube author/channel title;
- `kind` silently set by `detectVoiceKind(url)` → **"individual"** for any non-org
  host (so a show/brand channel is mislabeled as a person, and there is no way to
  set organization at import);
- a channel + a content item.

JC's words: "it's confusing when an individual is treated like content… there's no
place to put a [person's] name… it makes AfterMass with Ana Munley an individual."
The Vessel-name field and the Channel field both prefilled to the show name, and
there's no distinct "person" field.

Related data gotcha (from ACTS-177 investigation, worth folding in or noting): the
new channel's URL is `author.profileUrl || raw` — if the preview can't read the real
channel URL, the "channel" points at the **video**, not the account.

**Domain rule — attribution follows the publisher (JC).** Whether a pasted link
becomes an **individual's** or an **organization's** content is decided by **who
published it** (the posting account), not by who appears on screen. So:
- An individual in the app can have a video *about* Ascension, but if **Ascension
  published** it, it becomes content under **Ascension's** (organization) Vessel.
- Fr. Mike Schmitz can carry content that came **from Ascension's page** under **his**
  record when **he** is the publisher/host.
A video can therefore legitimately sit under either an individual or an organization —
the deciding factor is the publishing channel of the link, so `kind` must be correct
and correctable, and matching must key on the publisher account.

## The model JC wants (2026-09-09)
"Vessel" is the umbrella; an **individual** or an **organization** (a group of
voices) are both **kinds** of Vessel — so keep "Vessel", don't rename to "Voice".
The Look Up box's real gap: **no clear place to indicate the individual/organization
behind the content**, and on import the person's name is being treated as content.

On importing a YouTube (or any) link, the pieces map to **two different links**:

| Piece | Value | Tied to |
|---|---|---|
| **From** (the Vessel) | `@username` / name | the **general channel** link (`youtube.com/@anamunley`) |
| **Content** | the video title ("9 Things…") | the **specific** content link (`youtube.com/watch?v=…`) |

Auto-filling the name from the username is an acceptable default; the requirement is
that there's a **labeled place to set the individual/org**, distinct from the content,
and that the **channel URL is the channel home, not the video URL**.

## Acceptance criteria
- [ ] The staged paste-a-link card clearly separates **Vessel/person (or org) name**
      from **Channel name** — two labeled fields that don't both default to the show
      title. (Decide default: person field blank w/ placeholder, or derived from the
      `@handle`, with the channel/show name on the Channel — **confirm with JC**.)
- [ ] **Drop the "New vessel / No vessel (General)" dropdown jargon** (JC feedback,
      2026-09-09: users who just tapped *Add* don't yet think "vessel," and "No vessel
      (General)" is a double negative). Label the section **"From"** with a **Name**
      field (hint: "person or organization"); demote **General** to a quiet inline link
      ("Save to General instead"), not a peer dropdown option. No "vessel" word in the flow.
- [ ] The **channel URL is the channel home** (`author.profileUrl`), never the pasted
      **video/content URL** — fix the `|| raw` fallback so "1 channel" doesn't point at a
      single video. The **content link** stays the specific pasted URL.
- [ ] The **name/@username sets the Vessel**, never the content title; auto-fill from
      the username as a default, but it's clearly the Vessel's field, separate from Content.
- [ ] The Vessel is not silently named after the video/show; a channel-titled import
      no longer becomes a Vessel literally named "AfterMass with Ana Munley".
- [ ] **Kind is selectable at import** (individual / organization / ministry) — not
      forced to "individual" — and if the user later changes an imported individual
      to organization in the editor, it saves and stays organization.
- [ ] An individual entered via paste-a-link ends up shaped the same as one entered
      by hand (name = the person, channel = their account) — consistency is the point.
- [ ] (Fold in or note as follow-up) channel URL isn't a bare video URL — avoid
      `|| raw` producing a video-as-channel.
- [ ] No `STORAGE_KEY` bump unless a data-shape change is unavoidable (flag first).

## Tests
- **Unit**: `vesselNamePrefill` / `channelLabelFor` — person vs channel name derived
  correctly from author metadata; `detectVoiceKind` no longer the sole authority for
  kind. Planned (ACTS-92).
- **Integration**: stage a YouTube import in "new vessel" mode; assert person and
  channel fields are distinct and kind is selectable; save → Vessel named as the
  person, channel carries the show, kind respected. Planned.
- **E2E**: **flow E16** in [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md) — the
  full paste matrix (E16a–h): YouTube/Instagram content × individual/organization ×
  with/without an existing Vessel, plus the publisher-attribution rule and the
  no-duplicate-Vessel / person-vs-channel-name / kind-correctable cross-checks. Planned.
