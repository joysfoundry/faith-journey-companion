# Faith Journey — MVP Build Plan

The repository is currently the untouched Lovable starter template (one placeholder home route, default design tokens, no backend). So there is nothing from an old prototype to retrofit.

## 1. What can safely be reused
- TanStack Start routing shell, root layout, error/404 components
- shadcn/ui primitives, Tailwind v4 token setup in `src/styles.css`
- TanStack Query setup

## 2. What should be replaced
- `src/routes/index.tsx` placeholder → daily session-based Home
- Default slate/neutral design tokens → a warm, reverent Catholic devotional design system (parchment/ink/gold accents, serif display for prayer text, generous type scale so prayer content dominates)

## 3. What must be created
- Lovable Cloud backend (database, auth, storage for audio, server functions)
- Full relational schema (see below)
- Deterministic session compiler `generatePrayerSession(template, planContext, dateContext)` as a pure domain service in `src/domain/`, no UI coupling
- Routes: Home, Prayer Library + detail, Devotions, Templates (create from scratch / from existing + Save As), How To viewer with provenance, Start a Prayer wizard, Active Prayer Mode, Plans, Calendar (Today/Week/Month), Needs ("What's on your heart?"), Intentions, Daily Word / Mass / Homily, Life Library, Reflect, Import, Settings
- Seed migration from the supplied sources: Caro Family Rosary, 54-Day Rosary Novena, Chaplet of St. Michael, plus Divine Mercy Chaplet imported from thedivinemercy.org — each with Source provenance rows

## 4. Database / schema
Taxonomy kept separate, never collapsed: `prayer_type` (liturgical, devotional, traditional_expression), `devotion_type` (rosary, novena, chaplet, stations, litany, consecration, custom), `expression_type` (vocal, meditation, contemplation, scripture, silence, reflection).

Tables: `sources`, `prayers`, `prayer_versions`, `devotions`, `devotion_versions`, `how_tos`, `prayer_templates`, `template_items`, `prayer_plans`, `prayer_sessions`, `session_items`, `mystery_sets`, `mysteries`, `mystery_content`, `intentions`, `needs`, `recommendation_mappings`, `audio_recordings`, `template_audio_assignments`, `session_audio_assignments`, `audio_usage_events`, `daily_reading_references`, `mass_experiences`, `homilies`, `bible_program_days`, `life_library_items`, `reflections`, `reflection_links`, `external_calendar_links`, `user_settings`, `imports`, `import_proposals`.

Rules baked in: completion lives on `session_items` only (10 Hail Marys = 10 rows → same prayer_id); `traditional_duration` and `chosen_duration` stored separately; provenance fields incl. `provenance_status` (known / partially_known / unknown); UUID PKs everywhere for future Insights linking; every table gets RLS scoped to `auth.uid()` plus explicit GRANTs.

## 5. Implementation sequence (small, testable phases)
1. Design system + navigation + Home shell + taxonomy types
2. Cloud enabled, schema migration, auth
3. Prayer Library, versions, Devotions, Templates, How To + Source
4. PrayerPlan engine (once / daily / N days / weekly / custom), Daily Rosary preference, Calendar
5. Session compiler → PrayerSession → SessionItems → Active Prayer Mode (scroll + manual Done)
6. Audio: recordings, assignments, playback modes (none / full-session / item-by-item), progress modes (manual / auto-advance / voice follow / hybrid), Record Session, usage events, distinct mic-privacy banners
7. Mystery model, Rosary, Novena (configurable, phases), Chaplet — generic compiler only
8. Needs, Intentions, trusted recommendations, Pray Now / convert to Plan
9. Daily Word, Mass, Homily, honest transcription workflow states
10. Life Library + In Progress Home section, Reflect + ReflectionLink
11. Import: Upload → Analyze → Propose → Review → Save, with duplicate resolution (Use Existing / Use Imported / Save as Alternate / Compare)
12. Acceptance tests against the three supplied sources

## 6. Conflicts with the PRD
- None from existing code. Two constraints worth stating: licensed Scripture and Bible-in-a-Year content will not be populated (settings + reference only), and speech recognition for Voice Follow uses the browser Web Speech API where available with graceful fallback to manual Next/Done when confidence is low.

## AI boundary
No automatic rewriting of Reflections; no advanced Insights in MVP; no language that claims to interpret God's will anywhere in the UI copy.

I'll start with phase 1 and check in as each phase lands.
