---
story: ACTS-178
session: 01
wrapped_at: 2026-09-09T16:45:32-0700
status: Done
final: true
---

## What happened
Rebuilt the paste-a-link **Look Up** experience so the *who* (Vessel) is distinct from
the *channel* and the *content*, and made channels read as channels everywhere.

- **"From" section** ([QuickAddLink.tsx](../../src/components/knowledge/QuickAddLink.tsx)):
  replaced the "New vessel / No vessel (General)" dropdown jargon with a **Name** field
  (person or organization) + an **Individual / Organization** toggle (kind chosen at
  import, no longer forced by `detectVoiceKind`) + a quiet **"Save to General instead"**
  link ("Attribute to someone" to return).
- **Channel = the account home**, never the pasted content URL: dropped the
  `author.profileUrl || raw` fallback so a `watch?v=…` link can't be filed as a channel;
  when no home URL is known, the Vessel is created with **no** channel.
- **@handle default**: the From name defaults to the account's **@handle** (derived from
  the channel-home URL via `identityFromUrl`) — "@anamunley", not the show title
  "AfterMass with Ana Munley". (JC: "the from should default to @user in youtube.")
- **Platform-icon convention** (new [platform-icon.tsx](../../src/components/knowledge/platform-icon.tsx),
  `PLATFORM_ICON`): channels/links render as **platform icon + platform name**
  (YouTube/Instagram/Website…; TikTok borrows `Music`, `x` uses Twitter) in the library
  chips, the voice-detail Channels list, and the Home pins. Icon sits **by the channel**,
  not the name.
- **Home Vessels card** ([index.tsx](../../src/routes/index.tsx)): a Vessel's pinned
  channels are **grouped onto one row** with platform chips (like the By-Vessel view);
  a content pin is described by its **category** ("Book"), the link conveyed by the icon +
  the row opening it (JC: "Why We're Catholic is a book… Amazon is the link").

**Left intentionally:** the From name still *prefills* from metadata (editable);
after-the-fact kind edits ride the existing VoiceEditor. **Spun off:** ACTS-180
(paper-vs-audio-book typed link formats) from JC's "how I would divide it" idea.

## Verified (and how)
Browser (localhost:8080): paste `youtube.com/watch?v=…` → From shows **@anamunley** with
Individual selected, Channel shows the **@-home** URL (not the video); Individual/Org
toggle, "Save to General instead" → General line → "Attribute to someone" round-trip all
work; library chips + voice detail + Home pins show platform icons; @anamunley grouped to
one Home row with YouTube/Instagram chips; "Why We're Catholic" reads "Book". `tsc`
clean, no console errors on fresh load. (`identityFromUrl("…/@anamunley")` → handle
`anamunley` confirmed at the source.)

## Git state at handoff
Committed to `main`, **push from this env fails** → JC pushes. Code `c6c5224` +
`ca7d15a`, docs `691b4e9` + `ccb1a00`.

## Next
Done. Follow-ons filed: **ACTS-179** (Voice/Channel library filters), **ACTS-180**
(paper vs audio book link formats). See [[current-roadmap]].
