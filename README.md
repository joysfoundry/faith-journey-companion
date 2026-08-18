# Faith Journey Companion

I have included the PRD. I have included different prayer imports that can seed app, I have a url for import:  https://thedivinemercy.org/message/devotions/pray-the-chaplet FAITH JOURNEY

Final Clean-Build Lovable / Codex Prompt

Use this prompt with the Final Build-Ready MVP PRD attached. The PRD is the source of truth. Faith Journey — Final Lovable / Codex Build Prompt

1. Build Instruction

Build a new mobile-first application from scratch using the attached Faith Journey Final Build-Ready MVP PRD as the source of truth.

Do not retrofit the old prototype's architecture.

If a repository already exists, first inspect it and give me a concise implementation plan identifying: 1. what can safely be reused,
2. what should be replaced,
3. what must be created,

4. database/schema changes required,
5. implementation sequence,
6. any conflicts between the existing code and this PRD.

Then proceed in small, testable phases.

2. Product Purpose and AI Boundary

Faith Journey helps a person integrate Devotion, Need, Word, Learn, and Reflect in service of a deeper purpose: living faith, discerning God's will, and living the purpose to which the person is called.

The application may support discernment, but it must never claim to know God's will.

GOOD:
“A theme you've returned to: You've written about meaningful work six times in the past two months, including during your St. Joseph Novena and after two reflections connected to Scripture about service. Would you like to revisit those reflections?”

NOT ALLOWED:
“God is telling you to change jobs.”

The first is grounded in the user's own record. The second improperly claims to interpret God's will.

The system helps the user remember → connect → notice → reflect → discern. The user determines meaning.

3. Reflection vs Future Insights

Reflection is authored by the user. Do not automatically rewrite, summarize, interpret, polish, or transform it unless the user explicitly requests that.

Future Insights are pattern observations derived from the user's own Journey. Do not implement advanced Insights in MVP, but preserve stable IDs and clean links so future Insights can analyze Prayer, Intentions, Daily Word, Mass, Homilies, Life Library, Reflections, discernment questions, actions, and audio usage.

Preserve this long-term model: Life Experience
↓
Need / Intention

↓

Prayer

↓

Word

↓

Learn

↓

Reflect — my own words

↓

Insights — patterns across my Journey

↓

Discern — what might I need to consider?

↓

Act — how did I respond?

↓

Life Experience continues

4. Prayer Taxonomy

Prayer taxonomy is first-class.

PrayerType: liturgical, devotional, traditional_expression
DevotionType: rosary, novena, chaplet, stations, litany, consecration, custom ExpressionType: vocal, meditation, contemplation, scripture, silence, reflection

Do not collapse these into one type field. Not every Prayer requires a Devotion.

5. Core Model and Completion

Implement: Prayer PrayerVersion Devotion DevotionVersion PrayerTemplate PrayerPlan PrayerSession SessionItem

PrayerPlan is the shared scheduling layer. PrayerSession is one actual occurrence. SessionItem is one actual rendered item.

Completion belongs to SessionItem, never Prayer. Ten Hail Marys must create ten SessionItems referencing the same Prayer.

6. Home

Home is daily and session-based, not a feature dashboard.

Order:
1. Today's Devotions
2. What's on Your Heart? 3. Today's Word
4. Learn
5. Reflect

If Daily Rosary is enabled, show it first with today's Mystery, selected Template, Begin, Change Template, Customize Today.

Changing Template must offer Use Today Only or Make Default. Then show other due Sessions and + Start a Prayer.

7. Start a Prayer and Scheduling

Offer Rosary, Novena, Chaplet, Single Prayer, Saved Template, Custom Session.

Then ask:
Just once
Daily
For a number of days Weekly

Custom
Use one PrayerPlan engine for all of them.

If a Devotion has a traditional duration, suggest it, but store traditional_duration separately from chosen_duration.

Allow one-time PrayerSessions without requiring a recurring Plan.

8. Template Creation

Create New Template must offer Start from Scratch or Start from Existing Template, with a real existing-Template dropdown/list and Save As.

Do not mutate the base Template.

Session-specific customization must not mutate the Template unless the user explicitly saves it back.

9. How To vs Prayer Session

HowTo is instructional content; PrayerSession is the executable prayer experience.

Preserve this user-facing concept:
“These are instructions, not the prayer session. Starting prayer expands every instruction into the actual prayers.”

A How To may say “Say three Hail Marys” or “Repeat for the remaining four decades.” Start Prayer must expand those instructions into individual SessionItems.

HowTo should belong to Devotion/DevotionVersion, not PrayerSession.
From an active Session, allow View How To and return without losing progress.

10. How To Source / Provenance

Every How To must support visible provenance.

Support:
source name
organization / publisher / person / family
URL
original imported file
page/section where available
provenance_status: known, partially_known, unknown

Examples:
Source: Caro Family Rosary booklet Source: [Organization Name] · [URL] Source: Unknown

Do not leave missing provenance ambiguous.

11. Deterministic Session Compiler

Build a reusable domain service such as generatePrayerSession(template, planContext, dateContext).

It must resolve Template rules, date/day, Novena phase, Mystery, MysteryContent, PrayerVersion, optional content, repetition expansion, Session overrides, audio strategy/assignments, ordered SessionItems, and initial status.

Keep this logic out of UI components.
AI may assist import analysis, but after user approval runtime sequencing should be deterministic.

12. Active Prayer Mode

Always answer: What do I pray now?

Display:
current Prayer title
full Prayer text
Mystery when relevant
meditation when relevant
repetition number
subtle progress
Previous
Next
Pause
Done when tracking is enabled
Audio / Voice / Record controls where applicable

Prayer content should dominate the screen.

13. Audio Domain — Critical

Audio is a first-class domain and may exist at multiple levels.

Prayer-level audio: one Prayer may have recordings by multiple people.
Template-level audio: a Template may define preferred audio assignments or a full Template recording.
Session-level audio: a Session may use one full-session recording or an assembled set of item-level recordings.
SessionItem-level audio: one specific recording used for that occurrence.

A single Prayer can have recordings by Grandma, Mom, Dad, the user, a child, or a family recording. A Template can be a patchwork of different speakers.

A Session can inherit Template audio, override individual items, or use a complete full-session recording.

Do not model this as only one audio_id on Prayer.

14. Audio Models

Implement reusable AudioRecording records rather than embedding duplicated files inside Templates.

AudioRecording should support:
recording_scope: prayer, template, session, session_item
recording_type: single_prayer, session_item, full_session, meditation, instructional speaker/person metadata
audio storage reference
duration
transcript when available
source/provenance
recorded_in_app
timestamps

Implement TemplateAudioAssignment and SessionAudioAssignment to reference AudioRecording. Template audio preference may be none, assembled, or full_session_when_available.

15. Audio Playback and Progress

Separate playback mode from progress/navigation mode.

Playback modes: None
Full Session Audio Item-by-Item Audio

Progress/navigation modes: Manual Scroll
Audio Auto-Advance
Voice Follow

Hybrid

Audio Auto-Advance may mark a SessionItem complete at audio end and advance.
Voice Follow uses the microphone to estimate where the user is in the prayer and advance, but should tolerate pauses, accents, natural cadence, group prayer, small wording differences, and skipped words. It must not score pronunciation.

If confidence is low, remain on the current item and allow manual Next/Done. Progress mode can be set at Session level and overridden at SessionItem level.

16. Record Audio in Active Prayer Mode

Add Record Session as an explicit Session action.
The user can record the entire PrayerSession as one audio recording while praying. Recording may coexist with manual navigation or Voice Follow.

After recording completes, offer:
Save to This Session Only
Save as Reusable Full-Session Recording Use With This Template
Add to My Audio Library
Discard

Recording a Session creates a reusable AudioRecording. It must not alter the Prayer or Template unless the user explicitly chooses to assign or save it there.

17. Microphone Privacy

Voice Follow and Record Session are different microphone uses and must be visibly distinct.

Voice Follow:
“Microphone is being used to follow where you are in the prayer. Audio is not saved.”

Record Session:
“Your prayer audio is being recorded and will be saved when you finish.”

Do not conflate these states.

18. Audio Usage Tracking

Track audio use by recording, Prayer, Template, Session, SessionItem, and date.

Create AudioUsageEvent with: audio_recording_id
user_id
prayer_id

template_id
session_id
session_item_id
usage_type: played, recorded, assigned, inherited, overridden playback_mode

progress_mode started_at ended_at
used_at completion_status created_at

This usage history is part of preserving how the user/family prays over time.

19. Rosary / Mystery / Novena / Chaplet

Build generic architecture.
Mystery: MysterySet, Mystery, MysteryContent. Mystery is not a Prayer.

Rosary: opening prayers, Mystery sets, decades, repetition, after-decade prayers, closing prayers, family additions, Intentions.

Novena: configurable duration, phases, day-specific content, recurring cycles, nested Devotions, Intentions. Do not assume 9 days.

Chaplet: generic Template + compiler architecture. Do not create a special engine for each Chaplet.

20. Acceptance Tests

Use the supplied sources as acceptance tests, not hard-coded exceptions.

Caro Family Rosary:
detect reusable Prayers, family-specific Prayers, PrayerVersions, HowTo, Mystery schedule, repetitions, closings, family additions; create reusable Caro Family Rosary Template.

54-Day Rosary Novena:
detect Devotional / Novena / nested Rosary, 54 days, Petition and Thanksgiving phases, Mystery rotation, meditations, repetitions; generate correct daily Sessions.

Chaplet of St. Michael:
detect Chaplet structure, nine salutations, repeated Our Father/Hail Mary groups, additional Our Fathers, closing prayers; support one-time or multi-day Plan.

Single Prayer:
Pray Now or recurring PrayerPlan.

21. Need / Situational Prayer

Home section: What's on your heart?

Support free text plus quick categories such as Health, Work, Family, Grief, Anxiety, Guidance, Relationships, Forgiveness, Gratitude, Protection, Special Intention.

MVP recommendation model:
Situation → Tags → Trusted Recommendations

Recommendations may include individual Prayer, Rosary, Novena, Chaplet, Meditation. Actions: Pray Now or Create PrayerPlan.
Do not build an AI spiritual director.

22. Intentions

Intention represents why the user is praying.

Support petitionary and discernment-oriented Intentions, including: Mom's health
Find work
Give thanks

Help me discern this decision

Help me understand where I am called to serve Help me use my gifts
Help me grow in patience

Link Intention to Need, PrayerPlan, PrayerSession, Novena, Reflection.

23. Daily Word, Mass, Homily

Settings: Daily Mass Readings, Bible in a Year, Both, Neither. Do not populate licensed Scripture/program content in MVP.

Daily Mass Reading actions: Open Source
Mark Read
Heard at Mass

Reflect

If Heard at Mass, capture date, Church/parish, location, Priest, Mass time, notes, Daily Reading reference.

Homily supports priest/speaker, church, date, title, notes, URL, audio, video, transcript, transcription status.

Actions: Add Notes, Attach Audio, Attach Video, Paste URL, Transcribe, Reflect.
If transcription is not connected, create honest workflow/state rather than fake output.

24. Learn / Life Library

Home displays LifeLibraryItems with status = in_progress, approximately three plus View All In Progress.

Support Book, Article, Newsletter, Video, Sermon/Homily, Podcast, Show/Documentary, Other. Statuses: Not Started, In Progress, Finished.
MVP is logging only. Do not build semantic AI querying yet.

25. Reflect

Home prompt: What stayed with you today?
Create user-authored Reflection. Optional prompts are allowed.

Use flexible ReflectionLink relationships so one Reflection can connect to PrayerSession, SessionItem, PrayerPlan, Intention, Mystery, DailyReadingReference, MassExperience, Homily, BibleProgramDay, and LifeLibraryItem.

26. Calendar

Build internal Today, Week, Month views.
Home remains the primary place to begin Prayer.

Do not implement external calendar synchronization in MVP, but include future-ready scheduling fields and ExternalCalendarLink. Faith Journey remains source of truth.

27. Import and Source

Build Upload → Analyze → Propose → Review → Save. Initial formats: PDF, Word/text, pasted text.

Importer may identify Prayer, PrayerVersion, Devotion, DevotionVersion, Template, HowTo, Mystery, MysteryContent, repetition rules, conditionals, phases, duration, Source, and audio references.

Never silently commit importer guesses.

When an imported Prayer resembles an existing Prayer, offer Use Existing, Use Imported, Save as Alternate Version, Compare.

Preserve Source provenance including source name, organization/person/family, URL, original file, page/section, provenance status, metadata.

28. Build Order

Phase 1 — taxonomy, relational schema, typed models, navigation, Home shell
Phase 2 — Prayer Library, Prayer detail, PrayerVersions, Devotions, Templates, HowTo + Source Phase 3 — PrayerPlan, recurrence/duration, Daily Rosary preference, Calendar foundation
Phase 4 — deterministic Session compiler, PrayerSession, SessionItems, Scroll Only, Manual Done, Active Prayer Mode
Phase 5 — audio models, audio assignments, full-session audio, assembled audio, playback/progress modes, Record Session, audio usage tracking
Phase 6 — Mystery model, Rosary, Novena, Chaplet
Phase 7 — Intention, Situation, trusted recommendation mappings, Pray Now, convert to PrayerPlan
Phase 8 — Daily Word, MassExperience, Homily, transcription workflow state, Bible Program Phase 9 — Life Library, In Progress Home section, Reflection, ReflectionLink
Phase 10 — Import
Phase 11 — acceptance testing

Do not move to clever AI until PrayerPlan → PrayerSession → SessionItem → Active Prayer Mode and the core audio flows work correctly.

29. Future Architecture

Do not build Purpose, advanced Insights, Discernment Support, semantic Life Library, or the companion learning product in MVP.

Preserve stable IDs and clean relationships so future systems can connect Intention, Reflection, PrayerSession, PrayerPlan, DailyReadingReference, MassExperience, Homily, LifeLibraryItem, Source, AudioRecording, and AudioUsageEvent.

Future Insights must be grounded in the user's own data or clearly attributed learning sources and must never present pattern recognition as divine instruction.

30. Final Product Test

At every implementation decision ask:

Does this help the person spend less effort operating software and more attention praying, reflecting, learning, discerning, and living their faith?

For future AI ask:

Are we helping the user see their own Journey more clearly, or are we incorrectly claiming to interpret God's will for them?

Always choose the former.

Faith Journey — Final Lovable / Codex Build Prompt

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/020c7997-ffe5-4cef-8f89-a17a01cd0d1d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
