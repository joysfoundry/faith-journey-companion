/**
 * Local persistence layer. Shaped like a repository so it can be swapped for
 * Supabase queries without touching UI or domain logic.
 */
import { createContext, useContext } from "react";
import type {
  Database,
  ID,
  ImportDraft,
  Intention,
  NovenaInstance,
  Prayer,
  PrayerSession,
  PrayerTemplate,
  PrayerVersion,
  SessionContext,
  SessionItem,
  TemplateItem,
} from "./types";
import { createSeedDatabase } from "./seed";
import { detectRepetitionCount, stripRepetition } from "./importer";
import {
  completeSessionItem,
  generatePrayerSession,
  newId,
  uncompleteSessionItem,
} from "./compiler";

export const STORAGE_KEY = "prayer-companion-db-v1";

/** Variant group a prayer belongs to. Standalone prayers are their own group. */
export function variantGroupId(prayer: Prayer): ID {
  return prayer.variant_group_id ?? prayer.id;
}

/** All wordings of the same prayer, default first, then alphabetical by label. */
export function variantsOf(db: Database, prayer: Prayer): Prayer[] {
  const group = variantGroupId(prayer);
  return db.prayers
    .filter((p) => variantGroupId(p) === group)
    .sort(
      (a, b) =>
        Number(Boolean(b.is_default_variant)) - Number(Boolean(a.is_default_variant)) ||
        (a.variant_label ?? "").localeCompare(b.variant_label ?? ""),
    );
}

/**
 * Backfills the variant model and splits legacy multi-version prayers so each
 * wording is its own record. Safe to run on every load.
 */
export function normalizeVariants(db: Database): Database {
  const prayers: Prayer[] = [];
  const versions = [...db.prayer_versions];

  for (const prayer of db.prayers) {
    const group = variantGroupId(prayer);
    const own = versions.filter((v) => v.prayer_id === prayer.id);
    const primary =
      own.find((v) => v.id === prayer.default_version_id) ?? own[0];
    prayers.push({
      ...prayer,
      variant_group_id: group,
      variant_label: prayer.variant_label ?? primary?.label ?? "Traditional",
      is_default_variant: prayer.is_default_variant ?? true,
      ...(primary ? { default_version_id: primary.id } : {}),
    });

    // Legacy shape: extra versions on one prayer become sibling records.
    for (const extra of own.filter((v) => v.id !== primary?.id)) {
      const cloneId = `${prayer.id}--${extra.id}`;
      if (db.prayers.some((p) => p.id === cloneId)) continue;
      prayers.push({
        ...prayer,
        id: cloneId,
        variant_group_id: group,
        variant_label: extra.label,
        is_default_variant: false,
        favorite: false,
        default_version_id: extra.id,
      });
      const index = versions.findIndex((v) => v.id === extra.id);
      if (index >= 0) versions[index] = { ...extra, prayer_id: cloneId };
    }
  }

  // Guarantee exactly one default per group.
  const seen = new Set<ID>();
  const withDefaults = prayers.map((p) => {
    const group = variantGroupId(p);
    if (p.is_default_variant && !seen.has(group)) {
      seen.add(group);
      return p;
    }
    return { ...p, is_default_variant: false };
  });
  for (const group of new Set(withDefaults.map(variantGroupId))) {
    if (seen.has(group)) continue;
    const first = withDefaults.find((p) => variantGroupId(p) === group);
    if (first) first.is_default_variant = true;
  }

  return { ...db, prayers: withDefaults, prayer_versions: versions };
}

export function loadDatabase(): Database {
  if (typeof window === "undefined") return normalizeVariants(createSeedDatabase());
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeVariants(createSeedDatabase());
    const parsed = JSON.parse(raw) as Partial<Database>;
    return normalizeVariants({ ...createSeedDatabase(), ...parsed });
  } catch {
    return normalizeVariants(createSeedDatabase());
  }
}

export function saveDatabase(db: Database) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export interface AppStore {
  db: Database;
  ready: boolean;
  reset: () => void;
  toggleFavorite: (prayerId: ID) => void;
  upsertPrayer: (prayer: Prayer, version: PrayerVersion) => void;
  addPrayerVersion: (version: PrayerVersion) => void;
  addPrayerVariant: (
    basePrayerId: ID,
    variant: { label: string; body: string; makeDefault?: boolean },
  ) => void;
  setDefaultVariant: (prayerId: ID) => void;
  deletePrayer: (prayerId: ID) => void;
  saveTemplate: (template: PrayerTemplate, items: TemplateItem[]) => void;
  deleteTemplate: (templateId: ID) => void;
  deleteHowTo: (howToId: ID) => void;
  startSession: (templateId: ID, ctx: Partial<SessionContext>) => PrayerSession | undefined;
  setCursor: (sessionId: ID, cursor: number) => void;
  toggleItemDone: (itemId: ID) => void;
  finishSession: (sessionId: ID) => void;
  deleteSession: (sessionId: ID) => void;
  addIntention: (intention: Intention) => void;
  addNovenaInstance: (instance: NovenaInstance) => void;
  deleteNovenaInstance: (id: ID) => void;
  saveImportDraft: (draft: ImportDraft) => void;
  applyImportDraft: (draftId: ID) => void;
}

export const AppStoreContext = createContext<AppStore | null>(null);

export function useApp(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useApp must be used inside <AppStoreProvider>");
  return ctx;
}

/* ---------------- pure reducers used by the provider ---------------- */

export const mutations = {
  toggleFavorite(db: Database, prayerId: ID): Database {
    return {
      ...db,
      prayers: db.prayers.map((p) =>
        p.id === prayerId ? { ...p, favorite: !p.favorite } : p,
      ),
    };
  },
  upsertPrayer(db: Database, prayer: Prayer, version: PrayerVersion): Database {
    const exists = db.prayers.some((p) => p.id === prayer.id);
    const versionExists = db.prayer_versions.some((v) => v.id === version.id);
    return {
      ...db,
      prayers: exists
        ? db.prayers.map((p) => (p.id === prayer.id ? prayer : p))
        : [...db.prayers, prayer],
      prayer_versions: versionExists
        ? db.prayer_versions.map((v) => (v.id === version.id ? version : v))
        : [...db.prayer_versions, version],
    };
  },
  addPrayerVersion(db: Database, version: PrayerVersion): Database {
    return { ...db, prayer_versions: [...db.prayer_versions, version] };
  },
  /** Adds another wording of a prayer as its own record in the same group. */
  addPrayerVariant(
    db: Database,
    basePrayerId: ID,
    variant: { label: string; body: string; makeDefault?: boolean },
  ): Database {
    const base = db.prayers.find((p) => p.id === basePrayerId);
    if (!base) return db;
    const now = new Date().toISOString();
    const prayerId = newId("prayer");
    const versionId = newId("ver");
    const group = variantGroupId(base);
    const next: Database = {
      ...db,
      prayers: [
        ...db.prayers,
        {
          ...base,
          id: prayerId,
          variant_group_id: group,
          variant_label: variant.label,
          is_default_variant: false,
          favorite: false,
          default_version_id: versionId,
          created_at: now,
        },
      ],
      prayer_versions: [
        ...db.prayer_versions,
        {
          id: versionId,
          prayer_id: prayerId,
          label: variant.label,
          body: variant.body,
          language: "en",
          created_at: now,
        },
      ],
    };
    return variant.makeDefault ? mutations.setDefaultVariant(next, prayerId) : next;
  },
  /** Makes one wording the default for its whole variant group. */
  setDefaultVariant(db: Database, prayerId: ID): Database {
    const target = db.prayers.find((p) => p.id === prayerId);
    if (!target) return db;
    const group = variantGroupId(target);
    return {
      ...db,
      prayers: db.prayers.map((p) =>
        variantGroupId(p) === group ? { ...p, is_default_variant: p.id === prayerId } : p,
      ),
    };
  },
  deletePrayer(db: Database, prayerId: ID): Database {
    const removed = db.prayers.find((p) => p.id === prayerId);
    let prayers = db.prayers.filter((p) => p.id !== prayerId);
    // Promote a sibling wording when the default one is deleted.
    if (removed?.is_default_variant) {
      const group = variantGroupId(removed);
      const sibling = prayers.find((p) => variantGroupId(p) === group);
      if (sibling) {
        prayers = prayers.map((p) =>
          p.id === sibling.id ? { ...p, is_default_variant: true } : p,
        );
      }
    }
    return {
      ...db,
      prayers,
      prayer_versions: db.prayer_versions.filter((v) => v.prayer_id !== prayerId),
      template_items: db.template_items.filter((i) => i.prayer_id !== prayerId),
    };
  },
  saveTemplate(db: Database, template: PrayerTemplate, items: TemplateItem[]): Database {
    const exists = db.templates.some((t) => t.id === template.id);
    return {
      ...db,
      templates: exists
        ? db.templates.map((t) => (t.id === template.id ? template : t))
        : [...db.templates, template],
      template_items: [
        ...db.template_items.filter((i) => i.template_id !== template.id),
        ...items.map((item, index) => ({ ...item, position: index })),
      ],
    };
  },
  deleteTemplate(db: Database, templateId: ID): Database {
    return {
      ...db,
      templates: db.templates.filter((t) => t.id !== templateId),
      template_items: db.template_items.filter((i) => i.template_id !== templateId),
    };
  },
  deleteHowTo(db: Database, howToId: ID): Database {
    return { ...db, how_tos: db.how_tos.filter((h) => h.id !== howToId) };
  },
  startSession(
    db: Database,
    templateId: ID,
    ctx: Partial<SessionContext>,
  ): { db: Database; session?: PrayerSession } {
    const template = db.templates.find((t) => t.id === templateId);
    if (!template) return { db };
    const { session, items } = generatePrayerSession(db, template, ctx);
    return {
      db: {
        ...db,
        sessions: [session, ...db.sessions],
        session_items: [...db.session_items, ...items],
      },
      session,
    };
  },
  setCursor(db: Database, sessionId: ID, cursor: number): Database {
    return {
      ...db,
      sessions: db.sessions.map((s) => (s.id === sessionId ? { ...s, cursor } : s)),
    };
  },
  toggleItemDone(db: Database, itemId: ID): Database {
    return {
      ...db,
      session_items: db.session_items.map((i) =>
        i.id === itemId
          ? i.completion_status === "complete"
            ? uncompleteSessionItem(i)
            : completeSessionItem(i, "manual")
          : i,
      ),
    };
  },
  finishSession(db: Database, sessionId: ID): Database {
    return {
      ...db,
      sessions: db.sessions.map((s) =>
        s.id === sessionId ? { ...s, completed_at: new Date().toISOString() } : s,
      ),
    };
  },
  deleteSession(db: Database, sessionId: ID): Database {
    return {
      ...db,
      sessions: db.sessions.filter((s) => s.id !== sessionId),
      session_items: db.session_items.filter((i) => i.session_id !== sessionId),
    };
  },
  addIntention(db: Database, intention: Intention): Database {
    return { ...db, intentions: [...db.intentions, intention] };
  },
  addNovenaInstance(db: Database, instance: NovenaInstance): Database {
    return { ...db, novena_instances: [...db.novena_instances, instance] };
  },
  deleteNovenaInstance(db: Database, id: ID): Database {
    return { ...db, novena_instances: db.novena_instances.filter((n) => n.id !== id) };
  },
  saveImportDraft(db: Database, draft: ImportDraft): Database {
    return {
      ...db,
      sources: db.sources.some((s) => s.id === draft.source.id)
        ? db.sources
        : [...db.sources, draft.source],
      import_drafts: [draft, ...db.import_drafts.filter((d) => d.id !== draft.id)],
    };
  },
  /** Commits a reviewed import draft into the library. */
  applyImportDraft(db: Database, draftId: ID): Database {
    const draft = db.import_drafts.find((d) => d.id === draftId);
    if (!draft) return db;
    let next = db;
    /** Prayers saved by this draft, in document order — used to build the devotion. */
    const bundle: Array<{ prayer_id: ID; repetition_count: number }> = [];
    const headings: Array<{ index: number; label: string }> = [];
    for (const c of draft.candidates) {
      if (c.decision === "skip") continue;
      const repetition_count = detectRepetitionCount(c.title, c.body);
      if (c.decision === "use_existing") {
        if (c.duplicate_of_prayer_id)
          bundle.push({ prayer_id: c.duplicate_of_prayer_id, repetition_count });
        continue;
      }
      if (c.decision === "save_alternate_version" && c.duplicate_of_prayer_id) {
        next = mutations.addPrayerVersion(next, {
          id: newId("ver"),
          prayer_id: c.duplicate_of_prayer_id,
          label: `From ${draft.source.name}`,
          body: c.body,
          language: "en",
          source_id: draft.source.id,
          created_at: new Date().toISOString(),
        });
        bundle.push({ prayer_id: c.duplicate_of_prayer_id, repetition_count });
        continue;
      }
      if (c.classification === "prayer" || c.classification === "prayer_version") {
        const prayerId = newId("prayer");
        const versionId = newId("ver");
        const title = draft.devotion ? stripRepetition(c.title) || c.title : c.title;
        next = mutations.upsertPrayer(
          next,
          {
            id: prayerId,
            title,
            prayer_type: c.prayer_type ?? "devotional",
            expression_type: c.expression_type ?? "vocal",
            tags: ["imported"],
            favorite: false,
            default_version_id: versionId,
            source_id: draft.source.id,
            created_at: new Date().toISOString(),
          },
          {
            id: versionId,
            prayer_id: prayerId,
            label: "Imported",
            body: c.body,
            language: "en",
            source_id: draft.source.id,
            created_at: new Date().toISOString(),
          },
        );
        bundle.push({ prayer_id: prayerId, repetition_count });
      }
      if (c.classification === "mystery" || c.classification === "mystery_meditation") {
        headings.push({ index: bundle.length, label: c.title });
      }
      if (c.classification === "how_to") {
        const howToId = newId("howto");
        next = {
          ...next,
          how_tos: [
            ...next.how_tos,
            {
              id: howToId,
              title: c.title,
              summary: `Imported from ${draft.source.name} · source: ${
                draft.source.attribution ?? "self"
              }`,
              source_id: draft.source.id,
              template_id: c.link_template_id,
              steps: c.body
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((text, i) => ({
                  id: `${howToId}-s${i}`,
                  how_to_id: howToId,
                  position: i,
                  text,
                })),
            },
          ],
        };
      }
    }

    // A devotion is a bundle over the same single prayers, never a copy of them.
    if (draft.devotion && bundle.length > 0) {
      const templateId = newId("template");
      const items: TemplateItem[] = [];
      bundle.forEach((entry, index) => {
        const heading = headings.find((h) => h.index === index);
        if (heading) {
          items.push({
            id: newId("titem"),
            template_id: templateId,
            kind: "heading",
            position: items.length,
            label: heading.label,
            repetition_count: 1,
            optional: false,
          });
        }
        items.push({
          id: newId("titem"),
          template_id: templateId,
          kind: "prayer",
          position: items.length,
          prayer_id: entry.prayer_id,
          repetition_count: entry.repetition_count,
          optional: false,
        });
      });
      next = mutations.saveTemplate(
        next,
        {
          id: templateId,
          name: draft.devotion.name,
          description: draft.devotion.description ?? `Imported from ${draft.source.name}`,
          kind: "standard",
          mystery_presentation: "title_and_description",
          mystery_count: 0,
          source_id: draft.source.id,
          built_in: false,
          created_at: new Date().toISOString(),
        },
        items,
      );
      // Imported how-to guides with no target belong to the devotion just created.
      next = {
        ...next,
        how_tos: next.how_tos.map((h) =>
          h.source_id === draft.source.id && !h.template_id
            ? { ...h, template_id: templateId }
            : h,
        ),
      };
    }

    return {
      ...next,
      import_drafts: next.import_drafts.filter((d) => d.id !== draftId),
    };
  },
};

export type { SessionItem };
