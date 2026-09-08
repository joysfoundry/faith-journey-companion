---
story: ACTS-171
session: 02
wrapped_at: 2026-09-07T20:42:26-0700
status: Done
final: true
---

## What happened
Refined the quick-add from "save the link" to the full **Vessel = person / Channel =
account** model, driven by JC testing real links (an Instagram reel, a YouTube video).

**The model (decided this session):**
- The **Vessel is the *who*** — the person/ministry (e.g. "William Lovatsis", "Ana Munley").
- The **Channel is the account** under them, carrying **its own name**, kept separate so
  renaming the Vessel to the person never loses it:
  - **@username** for handle platforms — Instagram, TikTok, X, **podcast** (JC's call).
  - **channel/show/site name** for YouTube, website, etc.
- **YouTube gives no separate person name**, so the Vessel Name pre-fills with the *channel
  name* (from the page's `author`), editable → JC renames to the person if known. Confirmed
  acceptable ("it is good as is"). The channel keeps the channel name regardless.

**Code:**
- `fetchLinkPreview` (`src/lib/prayer/fetchSource.functions.ts`) now returns
  `author: { name, handle, profileUrl }` via `extractAuthor` — Instagram handle/name from
  twitter:title/og tags; YouTube channel from the player JSON (`author`, `ownerProfileUrl`);
  site name for the generic web. (Also: hex + decimal HTML-entity decoding.)
- `QuickAddLink.tsx`: Vessel name = the person (`vesselNamePrefill`); channel label =
  `channelLabelFor` (@username vs name); the account's **profile URL** becomes the channel
  (so a later post from the same account auto-attributes via `matchVoice`); staged card shows
  an editable **Channel** field + the profile URL.
- `VoiceEditor.tsx`: channel rows gained a name/username field (placeholder keyed to
  platform) so channels are nameable/editable by hand too.
- `isHandlePlatform()` in `knowledge.ts` — the shared @username-vs-name rule.

## Verified (and how)
Browser (dev :8080):
- IG reel `Db_-fjqp3Lp` → Vessel **"William Lovatsis"** (individual), Channel
  **"@billyloveofficial"** (profile URL), item a **Post → Media**; detail page reads
  "by William Lovatsis · Individual · from @billyloveofficial". Persisted shape confirmed.
- YouTube AfterMass link → **matched** JC's existing "AfterMass with Ana Munley" vessel by
  its @anamunley channel (no duplicate).
- Hex entity fix confirmed (• renders). `tsc --noEmit` clean.
- All test saves cleaned via the app UI (localStorage edits get clobbered by the running
  store — delete through the UI; see the dev-preview gotchas memory).

## Git state at handoff
On `main`, pushed by JC: `b70743e` (quick-add), `1e4e9f3` (account-not-domain naming),
`34b46fb` (Vessel/Channel split), plus `405f670` (ACTS-172 block-title fix) and the docs
commits. This handoff's docs commit is pending push.

## Next
- Non-social **article** save end-to-end + runtime **SSRF-guard** check
  (`http://localhost` / `169.254.169.254` rejected).
- Documented **tests**: Vitest for `fetchLinkPreview` parsing + `extractAuthor` +
  guardPreviewUrl; Testing Library for the quick-add attribution/naming paths.
- Note: JC's existing "AfterMass with Ana Munley" vessel is named after the show (built by
  hand before this model) — can be renamed to "Ana Munley" with the channel keeping the show
  name, but left as JC's data.
