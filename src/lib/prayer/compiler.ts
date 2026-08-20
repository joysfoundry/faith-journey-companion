/**
 * Deterministic session compiler.
 *
 * Template (compact, may contain shorthand like "Hail Mary x10")
 *   -> PrayerSession + ordered SessionItems (never shorthand).
 *
 * No React, no UI, no AI. Given the same template + context the output is
 * always identical.
 */
import type {
  Database,
  ID,
  Mystery,
  MysteryContent,
  MysteryPresentation,
  NovenaInstance,
  NovenaPhase,
  PrayerSession,
  PrayerTemplate,
  SessionContext,
  SessionItem,
  TemplateItem,
} from "./types";

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoWeekday(dateISO: string): number {
  const day = new Date(`${dateISO}T12:00:00`).getDay(); // 0 = Sunday
  return day === 0 ? 7 : day;
}

function daysBetween(startISO: string, endISO: string): number {
  const ms =
    new Date(`${endISO}T12:00:00`).getTime() - new Date(`${startISO}T12:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

/* ------------------------------------------------------------------ */
/* Mystery resolution                                                  */
/* ------------------------------------------------------------------ */

/** Date-based mystery set selection, overridable by the context. */
export function resolveMysterySet(db: Database, ctx: SessionContext): ID | undefined {
  if (ctx.mystery_set_id) return ctx.mystery_set_id;
  const weekday = isoWeekday(ctx.date);
  const match = db.mystery_sets.find((s) => s.default_weekdays.includes(weekday));
  return match?.id ?? db.mystery_sets[0]?.id;
}

export function mysteriesForSet(db: Database, setId: ID): Mystery[] {
  return db.mysteries
    .filter((m) => m.mystery_set_id === setId)
    .sort((a, b) => a.position - b.position);
}

export function mysteryContentFor(
  db: Database,
  mysteryId: ID,
  presentation: MysteryPresentation,
): MysteryContent | undefined {
  const all = db.mystery_contents.filter((c) => c.mystery_id === mysteryId);
  if (presentation === "title_only") return undefined;
  return (
    all.find((c) => c.variant === "short_description") ??
    all.find((c) => c.variant === "full_meditation") ??
    all[0]
  );
}

/* ------------------------------------------------------------------ */
/* Novena resolution                                                   */
/* ------------------------------------------------------------------ */

export interface NovenaDayResolution {
  day: number;
  phase?: NovenaPhase | undefined;
  mystery_set_id?: ID | undefined;
  condition_tags: string[];
  out_of_range: boolean;
}

export function resolveNovenaDay(
  template: PrayerTemplate,
  instance: NovenaInstance,
  dateISO: string,
): NovenaDayResolution {
  const cfg = template.novena;
  const day = daysBetween(instance.start_date, dateISO) + 1;
  if (!cfg) return { day, condition_tags: [], out_of_range: false };
  const phase = cfg.phases.find((p) => day >= p.start_day && day <= p.end_day);
  const cycle = cfg.mystery_cycle;
  const mystery_set_id =
    cycle.length > 0 ? cycle[(day - 1 + cycle.length) % cycle.length] : undefined;
  return {
    day,
    phase,
    mystery_set_id,
    condition_tags: phase?.condition_tag ? [phase.condition_tag] : [],
    out_of_range: day < 1 || day > cfg.duration_days,
  };
}

/* ------------------------------------------------------------------ */
/* Prayer version resolution                                           */
/* ------------------------------------------------------------------ */

export function resolvePrayerVersion(
  db: Database,
  prayerId: ID,
  ctx: SessionContext,
  templateVersionId?: ID,
): { versionId?: ID | undefined; title: string; body: string } {
  const prayer = db.prayers.find((p) => p.id === prayerId);
  const versionId =
    ctx.prayer_version_overrides[prayerId] ?? templateVersionId ?? prayer?.default_version_id;
  const version =
    db.prayer_versions.find((v) => v.id === versionId) ??
    db.prayer_versions.find((v) => v.prayer_id === prayerId);
  return {
    versionId: version?.id,
    title: prayer?.title ?? "Prayer",
    body: version?.body ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Session generation                                                  */
/* ------------------------------------------------------------------ */

export interface GeneratedSession {
  session: PrayerSession;
  items: SessionItem[];
}

export function defaultContext(partial: Partial<SessionContext> = {}): SessionContext {
  return {
    date: todayISO(),
    progress_mode: "scroll",
    include_optional: true,
    condition_tags: [],
    prayer_version_overrides: {},
    audio_enabled: false,
    ...partial,
  };
}

export function generatePrayerSession(
  db: Database,
  template: PrayerTemplate,
  contextInput: Partial<SessionContext> = {},
): GeneratedSession {
  const ctx = defaultContext(contextInput);

  // 1. Novena rules (day, phase, rotating mysteries) feed the context.
  let novenaLabel = "";
  if (template.kind === "novena" && ctx.novena_instance_id) {
    const instance = db.novena_instances.find((n) => n.id === ctx.novena_instance_id);
    if (instance) {
      const res = resolveNovenaDay(template, instance, ctx.date);
      ctx.novena_day = res.day;
      ctx.novena_phase_id = res.phase?.id;
      ctx.condition_tags = [...new Set([...ctx.condition_tags, ...res.condition_tags])];
      if (!contextInput.mystery_set_id && res.mystery_set_id) {
        ctx.mystery_set_id = res.mystery_set_id;
      }
      novenaLabel = ` — Day ${res.day}${res.phase ? ` (${res.phase.name})` : ""}`;
    }
  }

  // 2. Mystery resolution.
  const presentation = ctx.mystery_presentation ?? template.mystery_presentation;
  ctx.mystery_presentation = presentation;
  const setId = template.mystery_count > 0 ? resolveMysterySet(db, ctx) : undefined;
  if (setId) ctx.mystery_set_id = setId;
  const mysteries = setId ? mysteriesForSet(db, setId) : [];
  const setName = db.mystery_sets.find((s) => s.id === setId)?.name;

  const sessionId = newId("session");
  const items: SessionItem[] = [];
  let position = 0;

  const templateItems = db.template_items
    .filter((i) => i.template_id === template.id)
    .sort((a, b) => a.position - b.position);

  const push = (item: Omit<SessionItem, "id" | "session_id" | "position" | "progress_mode" | "completion_status" | "completion_method">) => {
    items.push({
      id: newId("item"),
      session_id: sessionId,
      position: position++,
      progress_mode: ctx.progress_mode,
      completion_status: "pending",
      completion_method: null,
      ...item,
    });
  };

  for (const item of templateItems) {
    // 3. Conditional content.
    if (item.condition_tag && !ctx.condition_tags.includes(item.condition_tag)) continue;
    if (item.optional && !ctx.include_optional) continue;

    if (item.kind === "heading") {
      push({ kind: "heading", title: item.label ?? "" });
      continue;
    }

    // Salutations are prayed like prayers, but their text is the V/R pair.
    if (item.kind === "salutation") {
      const body = [
        item.versicle ? `V. ${item.versicle}` : "",
        item.response ? `R. ${item.response}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const total = Math.max(1, item.repetition_count);
      for (let n = 1; n <= total; n++) {
        push({
          kind: "prayer",
          title: item.label ?? "Salutation",
          body,
          repetition_index: total > 1 ? n : undefined,
          repetition_total: total > 1 ? total : undefined,
        });
      }
      continue;
    }

    if (item.kind === "scripture") {
      const total = Math.max(1, item.repetition_count);
      for (let n = 1; n <= total; n++) {
        push({
          kind: "scripture",
          title: item.reference ?? item.label ?? "Scripture",
          body: item.body ?? "",
          reference: item.reference,
          repetition_index: total > 1 ? n : undefined,
          repetition_total: total > 1 ? total : undefined,
        });
      }
      continue;
    }

    if (item.kind === "external_link") {
      push({
        kind: "external_link",
        title: item.label ?? "Open link",
        body: item.body ?? undefined,
        configuration: { external_options: item.external_options ?? [] },
      });
      continue;
    }

    if (item.kind === "custom") {
      push({
        kind: "prayer",
        title: item.label ?? "Component",
        body: item.body ?? "",
      });
      continue;
    }

    if (item.kind === "intention") {
      const intention = db.intentions.find((i) => i.id === item.prayer_id);
      push({
        kind: "intention",
        title: item.label ?? "Intention",
        body: intention?.body ?? intention?.title ?? item.label ?? "",
      });
      continue;
    }

    if (item.kind === "mystery_placeholder") {
      const ordinal = item.mystery_ordinal ?? 1;
      const mystery = mysteries[ordinal - 1];
      if (!mystery) continue;
      const content = mysteryContentFor(db, mystery.id, presentation);
      push({
        kind: "mystery",
        title: mystery.title,
        body: presentation === "title_only" ? undefined : content?.body,
        mystery_id: mystery.id,
        mystery_content_id: content?.id,
        mystery_ordinal: ordinal,
        configuration: {
          presentation,
          set_name: setName,
          heading: `${ordinalWord(ordinal)} ${setName?.replace(" Mysteries", "") ?? ""} Mystery`.trim(),
        },
      });
      continue;
    }

    // 4 + 5. Expand repetitions, resolving the version once per occurrence.
    if (!item.prayer_id) continue;
    const total = Math.max(1, item.repetition_count);
    const resolved = resolvePrayerVersion(db, item.prayer_id, ctx, item.prayer_version_id);
    for (let n = 1; n <= total; n++) {
      push({
        kind: "prayer",
        title: resolved.title,
        body: resolved.body,
        prayer_id: item.prayer_id,
        prayer_version_id: resolved.versionId,
        repetition_index: total > 1 ? n : undefined,
        repetition_total: total > 1 ? total : undefined,
      });
    }
  }

  const session: PrayerSession = {
    id: sessionId,
    template_id: template.id,
    title: `${template.name}${novenaLabel}`,
    context: ctx,
    created_at: new Date().toISOString(),
    cursor: 0,
  };

  return { session, items };
}

export function ordinalWord(n: number): string {
  return (
    ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"][
      n - 1
    ] ?? `${n}th`
  );
}

/* ------------------------------------------------------------------ */
/* Completion                                                          */
/* ------------------------------------------------------------------ */

export function completeSessionItem(
  item: SessionItem,
  method: NonNullable<SessionItem["completion_method"]> = "manual",
): SessionItem {
  return {
    ...item,
    completion_status: "complete",
    completion_method: method,
    completed_at: new Date().toISOString(),
  };
}

export function uncompleteSessionItem(item: SessionItem): SessionItem {
  const next = { ...item, completion_status: "pending" as const, completion_method: null };
  delete next.completed_at;
  return next;
}

export function sessionProgress(items: SessionItem[]): { done: number; total: number } {
  const prayable = items.filter(
    (i) => i.kind === "prayer" || i.kind === "mystery" || i.kind === "external_link",
  );
  return {
    done: prayable.filter((i) => i.completion_status === "complete").length,
    total: prayable.length,
  };
}

/** Expands the compact template into a human-readable preview (no session). */
export function templateOutline(
  db: Database,
  template: PrayerTemplate,
): Array<{ label: string; detail?: string | undefined }> {
  return db.template_items
    .filter((i) => i.template_id === template.id)
    .sort((a, b) => a.position - b.position)
    .map((i) => {
      if (i.kind === "mystery_placeholder")
        return { label: `Mystery ${i.mystery_ordinal}`, detail: i.label };
      if (i.kind === "external_link") {
        const opts = i.external_options ?? [];
        const def = opts.find((o) => o.is_default) ?? opts[0];
        return { label: i.label ?? "External link", detail: def?.label };
      }
      if (i.kind === "scripture")
        return { label: i.reference ?? "Scripture", detail: i.body?.slice(0, 60) };
      if (i.kind !== "prayer") return { label: i.label ?? i.kind };
      const prayer = db.prayers.find((p) => p.id === i.prayer_id);
      return {
        label: prayer?.title ?? "Prayer",
        detail: i.repetition_count > 1 ? `× ${i.repetition_count}` : undefined,
      };
    });
}
