# Faith Journey — Photos & Gallery addendum (MVP placeholder)

Everything else follows the approved MVP build plan. This addendum records the
one added capability and where its data lives.

## Capability
Photos can be captured/attached in two places:
- during a **prayer session** (Active Prayer Mode)
- while writing a **reflection**

Every photo flows into a single, app-wide **Gallery** — photos are never duplicated
per surface.

## Data placeholders (phase 1: types only, no persistence)
- `photos` — id, storage_path, preview_url, caption, captured_at, context, context_id
- `photo_attachments` — join so one photo can appear on a session, a reflection, and the gallery
- `PhotoContext` = `prayer_session | reflection | mass | life_library`
- `prayer_sessions.photoIds` and `reflections.photoIds` carry the attached photo ids
- `GalleryEntry` view model + empty `galleryPlaceholder` data source

MVP scope: UI placeholders only ("Add photo" disabled, Gallery empty state on Home).
Real capture, Cloud storage upload, RLS-scoped `photos` / `photo_attachments`
tables and the Gallery route land with the Cloud phase.

## Phase 1 delivered
- Warm parchment/ink/gold design system, Cormorant Garamond + Karla, `prayer-text` utility
- Mobile-first `AppShell` with bottom nav (Today active; Prayers/Calendar/Reflect/Gallery pending)
- Home shell: today's prayer sessions with completion progress, In progress, Reflections, Gallery placeholder
- Taxonomy types (`prayer_type`, `devotion_type`, `expression_type`, provenance, plan cadence, audio/progress modes) and domain shapes
