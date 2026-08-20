# Jira backlog — ACTS PRD gap-merge

Paste-ready. Suggested **Epic: "ACTS PRD gap-merge into Faith Journey"**. Each row below is a Story unless noted. All DONE items are on branch `prd-gap-merge` (13 commits, not yet pushed).

---

## ✅ Done (close on merge)

| Type | Summary | Notes (commit) |
|---|---|---|
| Story | Generic External Link component + "Pray with the Pope" preset | `db2af68` — new `external_link` kind; multiple sources, one default; no provider engine |
| Story | Seed Chaplet of St. Michael | `db2af68` — via existing salutation/custom kinds, no chaplet-specific code |
| Story | Generic Scripture component (author-placeable, has citation) | `e0c36fc` — new `scripture` kind + builder editor |
| Story | Seed Scriptural Rosary (Luminous) — Scripture before each Hail Mary | `e0c36fc` (+ `8551e9d` for proper mystery) |
| Story | Promote Reflection / Learning / Mass to persisted store entities | `bc3009d` — ReflectionLink, Formation status toggle, MassExperience capture |
| Task | Rename user-facing "Formation" → "Learn"; collection = "Life Library" | `ba8dcb3` — data model stays `learning_items` |
| Task | Remove home greeting (user replacing it) | `0e7c4b6` |
| Epic/Story | Redesign "Add Prayer" — single vs devotion; manual / URL / photo intake | `8bd66c3` |
| Story | PrayerMedia — audio/video links + short recorded/uploaded clips (≤1.5 MB) | `8bd66c3` — persists on Prayer, editable |
| Story | Add-Prayer review-before-save + URL fetch returns page title | `8bd66c3` |
| Story | Prayer library — read-only details view + row actions (Pray now / Edit / expand) | `db345d2` — `startSinglePrayer` action |
| Bug | Fix prayer editor hydration race on hard reload / deep-link | `4ce5fb1` — gate on store `ready` |
| Epic/Story | Redesign devotion builder — JIRA add+type, review, auto How-To | `e79af8f` |
| Story | Builder: inline insert-between + fully-expanded Preview | `fe11b22` |
| Story | Builder: hover-only "+" with type dropdown; big Add button removed | `1f0fba1` |
| Story | Devotion Source field (name + URL) → upserts a Source | `1f0fba1` — `upsertSource` action |
| Story | Fixed mystery set on templates (pin Luminous, etc.) | `e79af8f` — `fixed_mystery_set_id` |
| Story | Petition + Meditation item kinds | `e79af8f` |
| Story | Template-level audio links (uploads stubbed) | `e79af8f` |
| Story | Auto-generate a numbered "How to pray …" guide on save | `e79af8f` |
| Bug/Story | Mysteries show "First Luminous Mystery" + title + description everywhere | `8551e9d` — Scriptural Rosary now uses real mystery placeholders |
| Story | Rosary: label each decade ("1st decade" …) in Pray mode | `f0ef646` |

---

## 🔜 Open (backlog)

| Priority | Type | Summary | Detail |
|---|---|---|---|
| P1 | Story | **Pray-mode tracker (ACTS-style)** | Prominent current item, **completed prayers grayed out**, **auto-scroll** as you advance. Preview already emits the fully-expanded list. |
| P2 | Story | **Touch drag-and-drop in builder** | Current reorder uses HTML5 DnD (desktop only). Add a touch lib (e.g. dnd-kit). |
| P2 | Task | **Push `prd-gap-merge` + open PR** | Sandbox can't push. `git push -u origin prd-gap-merge`, then PR into main. |
| P3 | Story | **Per-prayer media in devotion import** | Audio/video attaches to single prayers; bundle import currently doesn't — add media per detected prayer. |
| P3 | Story | **Real OCR for photo intake** | Photo intake is manual-transcribe seam; wire client-side OCR (tesseract.js) or cloud. |
| P3 | Story | **Enable Supabase persistence** | fjc's snake_case model maps 1:1 to Postgres; move the localStorage store to Supabase. |
| P3 | Bug | **Hydration race on remaining edit routes** | Fixed for prayer editor + template builder; audit other `useState`-from-store routes and gate on `ready`. |
| P4 | Story | **Restore "start from existing template" (Duplicate)** | Removed in the builder redesign; re-add as a Duplicate action if wanted. |
| P4 | Story | **ACTS framing** | Thread Adoration · Contrition · Thanksgiving · Supplication where it fits (branding / prayer categorization). |

---

_Generated 2026-08-19. See `HANDOFF.md` for run/architecture context._
