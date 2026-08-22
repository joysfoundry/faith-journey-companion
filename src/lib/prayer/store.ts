/**
 * Local persistence layer. Shaped like a repository so it can be swapped for
 * Supabase queries without touching UI or domain logic.
 */
import { createContext, useContext } from "react";
import type {
  Database,
  HowTo,
  ID,
  ImportDraft,
  Intention,
  KnowledgeCategory,
  KnowledgeItem,
  KnowledgeStatus,
  MassExperience,
  Prayer,
  PrayerSession,
  PrayerTemplate,
  PrayerVersion,
  Reflection,
  SessionContext,
  SessionItem,
  SessionPlan,
  Source,
  TemplateItem,
} from "./types";
import { RECURRENCE_ONCE, type Recurrence } from "./types";
import { createSeedDatabase } from "./seed";
import { detectRepetitionCount, stripRepetition } from "./importer";
import {
  completeSessionItem,
  defaultContext,
  generatePrayerSession,
  newId,
  nextOccurrence,
  todayISO,
  uncompleteSessionItem,
} from "./compiler";

export const STORAGE_KEY = "prayer-companion-db-v13";

/**
 * Migrate a legacy string recurrence ("daily"/"custom"/…) to the structured
 * calendar model. Objects pass through untouched. Used when loading old data.
 */
function migrateRecurrence(value: unknown): Recurrence {
  if (value && typeof value === "object" && "freq" in (value as Record<string, unknown>)) {
    const r = value as Recurrence;
    return { freq: r.freq, interval: r.interval ?? 1, count: r.count, until: r.until };
  }
  switch (value) {
    case "daily":
      return { freq: "daily", interval: 1 };
    case "weekly":
      return { freq: "weekly", interval: 1 };
    case "monthly":
      return { freq: "monthly", interval: 1 };
    default: // "none" | "custom" | undefined
      return { ...RECURRENCE_ONCE };
  }
}

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
    const primary = own.find((v) => v.id === prayer.default_version_id) ?? own[0];
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

  // Migrate stored plans to the structured recurrence model and anchor the
  // series (starts_on) so "Day N of M" has a fixed reference. Idempotent.
  const session_plans = (db.session_plans ?? []).map((plan) => ({
    ...plan,
    recurrence: migrateRecurrence((plan as { recurrence?: unknown }).recurrence),
    ...(plan.starts_on ? {} : plan.date ? { starts_on: plan.date } : {}),
  }));

  // Knowledge library: migrate any legacy `learning_items` (content_type/
  // has_transcript) onto the unified `knowledge_items` shape, and backfill
  // defaults on partial records. Idempotent.
  const legacy = (db as { learning_items?: unknown }).learning_items;
  const rawKnowledge = Array.isArray(db.knowledge_items)
    ? db.knowledge_items
    : Array.isArray(legacy)
      ? (legacy as unknown[])
      : [];
  const knowledge_items: KnowledgeItem[] = rawKnowledge.map((raw) =>
    normalizeKnowledgeItem(raw as Record<string, unknown>),
  );

  return {
    ...db,
    prayers: withDefaults,
    prayer_versions: versions,
    session_plans,
    knowledge_items,
  };
}

const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  "book",
  "article",
  "video",
  "podcast",
  "post",
  "program",
  "resource",
];

/** Coerce a stored/legacy record into a valid KnowledgeItem. */
function normalizeKnowledgeItem(raw: Record<string, unknown>): KnowledgeItem {
  const str = (k: string): string | undefined =>
    typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : undefined;
  const candidate = str("category") ?? str("content_type") ?? "book";
  // Map legacy content types that no longer exist as categories.
  const mapped =
    candidate === "sermon" || candidate === "show" || candidate === "newsletter"
      ? "video"
      : candidate === "course"
        ? "program"
        : candidate === "other"
          ? "article"
          : candidate;
  const category = (KNOWLEDGE_CATEGORIES as string[]).includes(mapped)
    ? (mapped as KnowledgeCategory)
    : "book";
  const status = ["not_started", "in_progress", "finished"].includes(str("status") ?? "")
    ? (raw["status"] as KnowledgeStatus)
    : "not_started";
  return {
    id: str("id") ?? `know-${Math.random().toString(36).slice(2)}`,
    title: str("title") ?? "Untitled",
    category,
    creator: str("creator"),
    source: str("source"),
    url: str("url"),
    notes: str("notes"),
    status,
    favorite: Boolean(raw["favorite"]) || undefined,
    start_date: str("start_date"),
    target_date: str("target_date"),
    reads_scripture: Boolean(raw["reads_scripture"]) || undefined,
    created_at: str("created_at") ?? new Date().toISOString(),
  };
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
  toggleTemplateFavorite: (templateId: ID) => void;
  duplicateTemplate: (templateId: ID) => ID | undefined;
  deleteHowTo: (howToId: ID) => void;
  saveHowTo: (howTo: HowTo) => void;
  createTemplateFromHowTo: (howToId: ID) => ID | undefined;
  startSession: (templateId: ID, ctx: Partial<SessionContext>) => PrayerSession | undefined;
  startBuiltSession: (
    templateId: ID | null,
    items: TemplateItem[],
    ctx: Partial<SessionContext>,
    title?: string,
    planId?: ID,
  ) => PrayerSession | undefined;
  startSinglePrayer: (prayerId: ID, ctx?: Partial<SessionContext>) => PrayerSession | undefined;
  setCursor: (sessionId: ID, cursor: number) => void;
  toggleItemDone: (itemId: ID) => void;
  finishSession: (sessionId: ID) => void;
  deleteSession: (sessionId: ID) => void;
  saveSessionPlan: (plan: SessionPlan) => void;
  deleteSessionPlan: (planId: ID) => void;
  addIntention: (intention: Intention) => void;
  saveImportDraft: (draft: ImportDraft) => void;
  applyImportDraft: (draftId: ID) => void;
  addSource: (source: Source) => void;
  upsertSource: (source: Source) => void;
  addReflection: (reflection: Reflection) => void;
  updateReflection: (reflection: Reflection) => void;
  deleteReflection: (id: ID) => void;
  addKnowledgeItem: (item: KnowledgeItem) => void;
  updateKnowledgeItem: (item: KnowledgeItem) => void;
  setKnowledgeStatus: (id: ID, status: KnowledgeStatus) => void;
  toggleKnowledgeFavorite: (id: ID) => void;
  deleteKnowledgeItem: (id: ID) => void;
  addMassExperience: (mass: MassExperience) => void;
  /** Pin the devotion the Home "daily" prayer card starts; undefined = the default Rosary. */
  setDailyTemplate: (templateId: ID | undefined) => void;
}

export const AppStoreContext = createContext<AppStore | null>(null);

export function useApp(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useApp must be used inside <AppStoreProvider>");
  return ctx;
}

/**
 * Turns one how-to step into the devotion component it describes, so a guide
 * populates a real template instead of a list of plain headings.
 */
function templateItemFromStep(
  db: Database,
  raw: string,
): Partial<TemplateItem> & { kind: TemplateItem["kind"] } {
  const text = raw.trim();
  const repetition =
    Number(
      /[(\s]x\s*(\d+)|\((\d+)\s*x\)/i.exec(text)?.[1] ?? /\((\d+)\s*x\)/i.exec(text)?.[1] ?? 1,
    ) || 1;
  const clean = text
    .replace(/[(\s]x\s*\d+\)?/i, "")
    .replace(/\(\d+\s*x\)/i, "")
    .trim();

  // Versicle / response pair, written on one or two lines.
  const vr = /v[/.\s]*\.?\s*(.+?)\s*r[/.\s]*\.?\s*(.+)/is.exec(text);
  if (/\bv\s*\/?\.\s*/i.test(text) && vr) {
    return {
      kind: "salutation",
      label: clean.split(/[:\n]/)[0]?.slice(0, 60) || "Salutation",
      versicle: vr[1]?.trim(),
      response: vr[2]?.trim(),
      repetition_count: repetition,
    };
  }

  if (/\b(mystery|mysteries|decade)\b/i.test(clean)) {
    return { kind: "mystery_placeholder", label: clean };
  }

  if (/\b(intention|petition)s?\b/i.test(clean)) {
    return { kind: "intention", label: clean };
  }

  // Match a library prayer by title mentioned in the step.
  const match = db.prayers
    .filter((p) => p.is_default_variant !== false)
    .find((p) => p.title.length > 3 && clean.toLowerCase().includes(p.title.toLowerCase()));
  if (match) {
    return { kind: "prayer", prayer_id: match.id, repetition_count: repetition };
  }

  return { kind: "heading", label: clean || text };
}

/* ---------------- pure reducers used by the provider ---------------- */

export const mutations = {
  toggleFavorite(db: Database, prayerId: ID): Database {
    return {
      ...db,
      prayers: db.prayers.map((p) => (p.id === prayerId ? { ...p, favorite: !p.favorite } : p)),
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
  toggleTemplateFavorite(db: Database, templateId: ID): Database {
    return {
      ...db,
      templates: db.templates.map((t) =>
        t.id === templateId ? { ...t, favorite: !t.favorite } : t,
      ),
    };
  },
  /** Copy a devotion (and its items) into a new editable, non-built-in devotion. */
  duplicateTemplate(db: Database, templateId: ID): { db: Database; templateId?: ID } {
    const source = db.templates.find((t) => t.id === templateId);
    if (!source) return { db };
    const newId_ = newId("tpl");
    const copy: PrayerTemplate = {
      ...source,
      id: newId_,
      name: `Copy of ${source.name}`,
      built_in: false,
      favorite: false,
      created_at: new Date().toISOString(),
    };
    const items = db.template_items
      .filter((i) => i.template_id === templateId)
      .sort((a, b) => a.position - b.position)
      .map((i, index) => ({ ...i, id: newId("titem"), template_id: newId_, position: index }));
    return {
      db: {
        ...db,
        templates: [copy, ...db.templates],
        template_items: [...db.template_items, ...items],
      },
      templateId: newId_,
    };
  },
  deleteHowTo(db: Database, howToId: ID): Database {
    return { ...db, how_tos: db.how_tos.filter((h) => h.id !== howToId) };
  },
  saveHowTo(db: Database, howTo: HowTo): Database {
    const exists = db.how_tos.some((h) => h.id === howTo.id);
    return {
      ...db,
      how_tos: exists
        ? db.how_tos.map((h) => (h.id === howTo.id ? howTo : h))
        : [...db.how_tos, howTo],
    };
  },
  /**
   * Turns a guide into an editable devotion template. Each instruction becomes a
   * heading item the user can replace with real prayers in the devotion editor.
   */
  createTemplateFromHowTo(db: Database, howToId: ID): { db: Database; templateId?: ID } {
    const howTo = db.how_tos.find((h) => h.id === howToId);
    if (!howTo) return { db };
    /** Re-running rebuilds the devotion from the guide's current steps. */
    const previous = howTo.template_id
      ? db.templates.find((t) => t.id === howTo.template_id)
      : undefined;
    const templateId = previous ? previous.id : newId("tmpl");
    const template: PrayerTemplate = {
      id: templateId,
      name:
        previous?.name ||
        howTo.title.replace(/^how to (pray|say|recite)\s*/i, "").trim() ||
        howTo.title,
      description: previous?.description ?? howTo.summary,
      kind: "standard",
      mystery_presentation: previous?.mystery_presentation ?? "title_only",
      mystery_count: 0,
      built_in: false,
      created_at: previous?.created_at ?? new Date().toISOString(),
      ...(previous?.notes ? { notes: previous.notes } : {}),
      ...(howTo.source_id ? { source_id: howTo.source_id } : {}),
    };
    let mysteryOrdinal = 0;
    const items: TemplateItem[] = howTo.steps.map((step, index) => {
      const parsed = templateItemFromStep(db, step.text);
      if (parsed.kind === "mystery_placeholder") {
        mysteryOrdinal += 1;
        parsed.mystery_ordinal = mysteryOrdinal;
      }
      return {
        id: newId("titem"),
        template_id: templateId,
        position: index,
        repetition_count: 1,
        optional: false,
        ...parsed,
      } as TemplateItem;
    });
    template.mystery_count = mysteryOrdinal;
    if (mysteryOrdinal > 0) template.kind = "rosary";
    return {
      db: {
        ...db,
        templates: previous
          ? db.templates.map((t) => (t.id === templateId ? template : t))
          : [...db.templates, template],
        template_items: [
          ...db.template_items.filter((i) => i.template_id !== templateId),
          ...items,
        ],
        how_tos: db.how_tos.map((h) => (h.id === howToId ? { ...h, template_id: templateId } : h)),
      },
      templateId,
    };
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
  /**
   * Compile a session from an explicit (session-customized) item list. The base
   * template — when there is one — supplies mystery settings; its stored items
   * are ignored in favor of `sessionItems`. Passing no `templateId` builds an
   * ad-hoc standard session. Nothing about the base template is mutated.
   */
  startBuiltSession(
    db: Database,
    templateId: ID | null,
    sessionItems: TemplateItem[],
    ctx: Partial<SessionContext>,
    title?: string,
    planId?: ID,
  ): { db: Database; session?: PrayerSession } {
    const base = templateId ? db.templates.find((t) => t.id === templateId) : undefined;
    const workId = base?.id ?? newId("adhoc");
    const mysteryCount = sessionItems.filter((i) => i.kind === "mystery_placeholder").length;
    const template: PrayerTemplate = base
      ? { ...base, mystery_count: mysteryCount }
      : {
          id: workId,
          name: title?.trim() || "Prayer session",
          kind: mysteryCount > 0 ? "rosary" : "standard",
          mystery_presentation: "title_and_description",
          mystery_count: mysteryCount,
          built_in: false,
          created_at: new Date().toISOString(),
        };
    const previewDb: Database = {
      ...db,
      template_items: [
        ...db.template_items.filter((i) => i.template_id !== workId),
        ...sessionItems.map((it, i) => ({ ...it, template_id: workId, position: i })),
      ],
    };
    const { session, items } = generatePrayerSession(previewDb, template, ctx);
    const titled: PrayerSession = {
      ...session,
      ...(title?.trim() ? { title: title.trim() } : {}),
      ...(planId ? { plan_id: planId } : {}),
    };
    return {
      db: {
        ...db,
        sessions: [titled, ...db.sessions],
        session_items: [...db.session_items, ...items],
      },
      session: titled,
    };
  },
  /** Pray a single prayer immediately — a one-item session, no template needed. */
  startSinglePrayer(
    db: Database,
    prayerId: ID,
    ctx: Partial<SessionContext> = {},
  ): { db: Database; session?: PrayerSession } {
    const prayer = db.prayers.find((p) => p.id === prayerId);
    if (!prayer) return { db };
    const version =
      db.prayer_versions.find((v) => v.id === prayer.default_version_id) ??
      db.prayer_versions.find((v) => v.prayer_id === prayerId);
    const context = defaultContext({ progress_mode: "scroll", ...ctx });
    const sessionId = newId("session");
    const session: PrayerSession = {
      id: sessionId,
      template_id: "",
      title: prayer.title,
      context,
      created_at: new Date().toISOString(),
      cursor: 0,
    };
    const item: SessionItem = {
      id: newId("item"),
      session_id: sessionId,
      kind: "prayer",
      position: 0,
      prayer_id: prayer.id,
      prayer_version_id: version?.id,
      title: prayer.title,
      body: version?.body ?? "",
      progress_mode: context.progress_mode,
      completion_status: "pending",
      completion_method: null,
    };
    return {
      db: {
        ...db,
        sessions: [session, ...db.sessions],
        session_items: [...db.session_items, item],
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
    const session = db.sessions.find((s) => s.id === sessionId);
    // A recurring plan rolls forward to its next occurrence when finished.
    let session_plans = db.session_plans;
    const plan = session?.plan_id
      ? db.session_plans.find((p) => p.id === session.plan_id)
      : undefined;
    if (plan && plan.recurrence.freq !== "none") {
      // Advance to the next occurrence; a null means the series (count/until) is
      // spent, so leave the plan on its last date and stop rolling forward.
      const nextDate = nextOccurrence(
        plan.starts_on ?? plan.date,
        plan.recurrence,
        plan.date ?? todayISO(),
      );
      if (nextDate) {
        session_plans = db.session_plans.map((p) =>
          p.id === plan.id ? { ...p, date: nextDate } : p,
        );
      }
    }

    let completedPlanId: ID | undefined;
    // A single prayer prayed ad-hoc (search → play → finish; template_id "" and no
    // plan) is captured as a saved session: today, once, so it lands in Sessions.
    if (session && !session.plan_id && session.template_id === "") {
      const planItems: TemplateItem[] = db.session_items
        .filter((i) => i.session_id === sessionId && i.prayer_id)
        .sort((a, b) => a.position - b.position)
        .map((i, idx) => ({
          id: newId("titem"),
          template_id: "",
          kind: "prayer",
          position: idx,
          prayer_id: i.prayer_id,
          ...(i.prayer_version_id ? { prayer_version_id: i.prayer_version_id } : {}),
          repetition_count: 1,
          optional: false,
        }));
      if (planItems.length > 0) {
        completedPlanId = newId("plan");
        session_plans = [
          {
            id: completedPlanId,
            template_id: "",
            purpose: session.title,
            date: todayISO(),
            starts_on: todayISO(),
            recurrence: { ...RECURRENCE_ONCE },
            context: session.context,
            items: planItems,
            created_at: new Date().toISOString(),
          },
          ...session_plans,
        ];
      }
    }

    return {
      ...db,
      session_plans,
      sessions: db.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              completed_at: new Date().toISOString(),
              ...(completedPlanId ? { plan_id: completedPlanId } : {}),
            }
          : s,
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
  /** Add or update a saved session plan (upsert by id). */
  saveSessionPlan(db: Database, plan: SessionPlan): Database {
    const exists = db.session_plans.some((p) => p.id === plan.id);
    return {
      ...db,
      session_plans: exists
        ? db.session_plans.map((p) => (p.id === plan.id ? plan : p))
        : [plan, ...db.session_plans],
    };
  },
  deleteSessionPlan(db: Database, planId: ID): Database {
    return { ...db, session_plans: db.session_plans.filter((p) => p.id !== planId) };
  },
  addIntention(db: Database, intention: Intention): Database {
    return { ...db, intentions: [...db.intentions, intention] };
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
    /**
     * Notes the source carries about the devotion. Explicit notes win; otherwise
     * the prose blocks detected in the document (common for imported URLs).
     */
    const sourceNotes =
      draft.devotion?.notes?.trim() ||
      draft.candidates
        .filter((c) => c.classification === "source_material")
        .map((c) => `${c.title}\n${c.body}`.trim())
        .join("\n\n")
        .trim();
    for (const c of draft.candidates) {
      if (c.decision === "skip") continue;
      const repetition_count = detectRepetitionCount(c.title, c.body);
      if (c.decision === "use_existing") {
        if (c.duplicate_of_prayer_id)
          bundle.push({ prayer_id: c.duplicate_of_prayer_id, repetition_count });
        continue;
      }
      if (c.decision === "save_alternate_version" && c.duplicate_of_prayer_id) {
        // Alternate wordings are their own prayer record inside the same group,
        // so the imported devotion can use this exact wording.
        const base = next.prayers.find((p) => p.id === c.duplicate_of_prayer_id);
        const variantId = newId("prayer");
        const variantVersionId = newId("ver");
        if (base) {
          next = mutations.upsertPrayer(
            next,
            {
              ...base,
              id: variantId,
              variant_group_id: variantGroupId(base),
              variant_label: `From ${draft.source.name}`,
              is_default_variant: false,
              favorite: false,
              default_version_id: variantVersionId,
              source_id: draft.source.id,
              created_at: new Date().toISOString(),
            },
            {
              id: variantVersionId,
              prayer_id: variantId,
              label: `From ${draft.source.name}`,
              body: c.body,
              language: "en",
              source_id: draft.source.id,
              created_at: new Date().toISOString(),
            },
          );
          bundle.push({ prayer_id: variantId, repetition_count });
        } else {
          bundle.push({ prayer_id: c.duplicate_of_prayer_id, repetition_count });
        }
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
            variant_group_id: prayerId,
            variant_label: "Imported",
            is_default_variant: true,
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
          // Notes the source gives about the devotion: whatever the user kept,
          // otherwise the prose blocks detected in the document.
          ...(sourceNotes ? { notes: sourceNotes } : {}),
          kind: "standard",
          mystery_presentation: "title_and_description",
          mystery_count: 0,
          // Reviewed default schedule (e.g. a "54-day" novena detected from the text).
          ...(draft.devotion.recurrence ? { default_recurrence: draft.devotion.recurrence } : {}),
          ...(draft.devotion.hour ? { default_hour: draft.devotion.hour } : {}),
          ...(draft.devotion.start_time ? { default_start_time: draft.devotion.start_time } : {}),
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
          h.source_id === draft.source.id && !h.template_id ? { ...h, template_id: templateId } : h,
        ),
      };
    }

    return {
      ...next,
      import_drafts: next.import_drafts.filter((d) => d.id !== draftId),
    };
  },

  addSource(db: Database, source: Source): Database {
    return { ...db, sources: [source, ...db.sources] };
  },
  upsertSource(db: Database, source: Source): Database {
    const exists = db.sources.some((s) => s.id === source.id);
    return {
      ...db,
      sources: exists
        ? db.sources.map((s) => (s.id === source.id ? source : s))
        : [source, ...db.sources],
    };
  },

  // --- Journey layer: Reflection / Learning / Mass ---------------------
  addReflection(db: Database, reflection: Reflection): Database {
    return { ...db, reflections: [reflection, ...db.reflections] };
  },
  updateReflection(db: Database, reflection: Reflection): Database {
    return {
      ...db,
      reflections: db.reflections.map((r) => (r.id === reflection.id ? reflection : r)),
    };
  },
  deleteReflection(db: Database, id: ID): Database {
    return { ...db, reflections: db.reflections.filter((r) => r.id !== id) };
  },
  addKnowledgeItem(db: Database, item: KnowledgeItem): Database {
    return { ...db, knowledge_items: [item, ...db.knowledge_items] };
  },
  updateKnowledgeItem(db: Database, item: KnowledgeItem): Database {
    return {
      ...db,
      knowledge_items: db.knowledge_items.map((i) => (i.id === item.id ? item : i)),
    };
  },
  setKnowledgeStatus(db: Database, id: ID, status: KnowledgeStatus): Database {
    return {
      ...db,
      knowledge_items: db.knowledge_items.map((i) => (i.id === id ? { ...i, status } : i)),
    };
  },
  toggleKnowledgeFavorite(db: Database, id: ID): Database {
    return {
      ...db,
      knowledge_items: db.knowledge_items.map((i) =>
        i.id === id ? { ...i, favorite: !i.favorite } : i,
      ),
    };
  },
  deleteKnowledgeItem(db: Database, id: ID): Database {
    return { ...db, knowledge_items: db.knowledge_items.filter((i) => i.id !== id) };
  },
  addMassExperience(db: Database, mass: MassExperience): Database {
    return { ...db, mass_experiences: [mass, ...db.mass_experiences] };
  },
  setDailyTemplate(db: Database, templateId: ID | undefined): Database {
    return { ...db, settings: { ...db.settings, daily_template_id: templateId } };
  },
};

export type { SessionItem };
