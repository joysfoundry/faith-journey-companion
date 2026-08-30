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
  Frequency,
  ID,
  ListenSource,
  Mystery,
  MysteryContent,
  MysteryPresentation,
  PrayerSession,
  PrayerTemplate,
  Recurrence,
  SessionContext,
  SessionItem,
  SessionPlan,
  TemplateItem,
} from "./types";

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/* ------------------------------------------------------------------ */
/* Dedication tokens — pray a devotion "for" a named soul (ACTS-121)   */
/* ------------------------------------------------------------------ */

const PRONOUN_FORMS: Record<import("./types").Pronoun, { subj: string; obj: string; poss: string }> =
  {
    she: { subj: "she", obj: "her", poss: "her" },
    he: { subj: "he", obj: "him", poss: "his" },
    they: { subj: "they", obj: "them", poss: "their" },
  };

/**
 * Substitute dedication tokens in prayer text for a session prayed for a soul.
 *
 * Tokens (case-insensitive; a capitalized token capitalizes the result):
 * - `{name}`  → the person's name, else "the faithful departed"
 * - `{subj}`  → she / he / they
 * - `{obj}`   → her / him / them
 * - `{poss}`  → her / his / their
 * - `{us}`    → the object pronoun when a soul is named/chosen, else "us" — for
 *              general prayers (e.g. the Litany of Loreto's "pray for us") that
 *              become "pray for her/them" only when offered for the departed.
 *
 * With no dedication, tokens fall back to the plural ("the faithful departed",
 * they/them/their) and `{us}` stays "us" — so an un-dedicated session reads
 * exactly as the traditional text.
 */
export function substituteDedication(
  text: string,
  forWhom?: import("./types").Dedication,
): string {
  if (!text || text.indexOf("{") === -1) return text;
  const forms = PRONOUN_FORMS[forWhom?.pronoun ?? "they"];
  const name = forWhom?.name?.trim() || "the faithful departed";
  const map: Record<string, string> = {
    name,
    subj: forms.subj,
    obj: forms.obj,
    poss: forms.poss,
    us: forWhom ? forms.obj : "us",
  };
  return text.replace(/\{(name|subj|obj|poss|us)\}/gi, (whole, key: string) => {
    const val = map[key.toLowerCase()];
    if (val === undefined) return whole;
    return /^[A-Z]/.test(key) ? val.charAt(0).toUpperCase() + val.slice(1) : val;
  });
}

export function todayISO(): string {
  // Local calendar date, not UTC. `toISOString()` is UTC, which rolls to the
  // next day in the evening for negative-offset zones — that made Saturday
  // evening resolve to Sunday's mysteries (Glorious instead of Joyful).
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoWeekday(dateISO: string): number {
  const day = new Date(`${dateISO}T12:00:00`).getDay(); // 0 = Sunday
  return day === 0 ? 7 : day;
}

function daysBetween(startISO: string, endISO: string): number {
  const ms = new Date(`${endISO}T12:00:00`).getTime() - new Date(`${startISO}T12:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

function addUnits(dateISO: string, freq: Frequency, n: number): string {
  const d = new Date(`${dateISO}T12:00:00`);
  if (freq === "daily") d.setDate(d.getDate() + n);
  else if (freq === "weekly") d.setDate(d.getDate() + n * 7);
  else if (freq === "monthly") d.setMonth(d.getMonth() + n);
  else if (freq === "yearly") d.setFullYear(d.getFullYear() + n);
  return d.toISOString().slice(0, 10);
}

const FREQ_UNIT: Record<Frequency, string> = {
  none: "time",
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

/* ----------------------------- Recurrence ------------------------------ */
// One calendar-style model (RRULE subset) drives every schedule: session plans,
// devotion defaults, and the "Day N of M" a running session shows.

/** Human label for a recurrence, e.g. "Once", "Daily · 9 days", "Every 2 weeks". */
export function recurrenceLabel(r: Recurrence | undefined): string {
  if (!r || r.freq === "none") return "Once";
  const unit = FREQ_UNIT[r.freq];
  const every =
    r.interval > 1
      ? `Every ${r.interval} ${unit}s`
      : `${r.freq[0]!.toUpperCase()}${r.freq.slice(1)}`;
  if (r.count && r.count > 1) return `${every} · ${r.count} ${unit}s`;
  if (r.until) return `${every} · until ${r.until}`;
  return every;
}

/**
 * Display name for a saved session plan. Prefers the user's Purpose, then the
 * base devotion's name, then — for a from-scratch session — the first prayer or
 * song it contains (so a single ad-hoc prayer reads as its own name, not the
 * generic "Session"). Falls back to a section heading, then "Prayer session".
 */
export function planTitle(db: Database, plan: SessionPlan): string {
  if (plan.purpose?.trim()) return plan.purpose.trim();
  const tpl = db.templates.find((t) => t.id === plan.template_id);
  if (tpl?.name) return tpl.name;
  for (const it of plan.items ?? []) {
    if (it.kind === "prayer" || it.kind === "song") {
      const prayer = db.prayers.find((p) => p.id === it.prayer_id);
      if (prayer?.title) return prayer.title;
    }
    if (it.kind === "heading" && it.label?.trim()) return it.label.trim();
  }
  return "Prayer session";
}

/**
 * Which occurrence `onDate` is within a series anchored at `startsOn`.
 * `index` is 1-based; `total` is the recurrence `count` when bounded.
 * Returns null for a non-repeating series or when the anchor is missing.
 */
export function occurrenceInfo(
  startsOn: string | undefined,
  r: Recurrence | undefined,
  onDate: string,
): { index: number; total?: number | undefined } | null {
  if (!startsOn || !r || r.freq === "none") return null;
  const elapsed = daysBetween(startsOn, onDate);
  if (elapsed < 0) return null;
  const perStep = r.freq === "daily" ? r.interval : r.freq === "weekly" ? r.interval * 7 : null; // month/year handled below by counting
  let index: number;
  if (perStep) {
    index = Math.floor(elapsed / perStep) + 1;
  } else {
    // Count month/year steps by walking forward until we pass onDate.
    let i = 0;
    while (addUnits(startsOn, r.freq, i + 1) <= onDate) i += 1;
    index = i + 1;
  }
  return { index, total: r.count };
}

/**
 * The next occurrence date strictly after `fromDate`, or null when the series is
 * exhausted (past `count` occurrences or `until`). Anchored at `startsOn` so the
 * bound is measured from the true series start, not the rolling date.
 */
export function nextOccurrence(
  startsOn: string | undefined,
  r: Recurrence | undefined,
  fromDate: string,
): string | null {
  if (!r || r.freq === "none") return null;
  const anchor = startsOn ?? fromDate;
  const current = occurrenceInfo(anchor, r, fromDate);
  const currentIndex = current?.index ?? 1;
  if (r.count && currentIndex >= r.count) return null;
  const next = addUnits(fromDate, r.freq, r.interval);
  if (r.until && next > r.until) return null;
  return next;
}

/**
 * The last date a bounded series lands on, or undefined for an open-ended one.
 * A `count`-bounded series ends `count - 1` steps after `startsOn`; an `until`
 * bound ends on the last occurrence on or before `until`. Anchored at `startsOn`
 * so it holds even when the series started before it was created (a back-dated
 * novena) — the same anchor `occurrenceInfo` counts "Day X" from.
 */
export function seriesEndDate(
  startsOn: string | undefined,
  r: Recurrence | undefined,
): string | undefined {
  if (!startsOn || !r || r.freq === "none") return undefined;
  if (r.count && r.count > 0) return addUnits(startsOn, r.freq, r.interval * (r.count - 1));
  if (r.until) {
    let last = startsOn;
    for (let i = 1; ; i += 1) {
      const next = addUnits(startsOn, r.freq, r.interval * i);
      if (next > r.until) break;
      last = next;
    }
    return last;
  }
  return undefined; // open-ended — never fulfills the daily rosary
}

/**
 * Whether `plan` stands in for the Daily Rosary on `date`: it opted in via
 * `fulfills_daily_rosary` and `date` falls in its bounded window
 * `[starts_on … last occurrence]`. Open-ended or unbounded plans never qualify.
 */
export function fulfillsDailyRosaryOn(plan: SessionPlan, date: string): boolean {
  if (!plan.fulfills_daily_rosary) return false;
  const start = plan.starts_on ?? plan.date;
  if (!start || date < start) return false;
  const end = seriesEndDate(start, plan.recurrence);
  return end !== undefined && date <= end;
}

/**
 * The single plan fulfilling the Daily Rosary on `date`, if any. Creation
 * warns/blocks overlaps, so at most one should ever match; if two do, the
 * latest-starting one wins.
 */
export function activeDailyRosaryFulfiller(
  plans: SessionPlan[],
  date: string,
): SessionPlan | undefined {
  return plans
    .filter((p) => fulfillsDailyRosaryOn(p, date))
    .sort((a, b) => (b.starts_on ?? b.date ?? "").localeCompare(a.starts_on ?? a.date ?? ""))[0];
}

/**
 * Do two plans' bounded daily-rosary windows share any day? Used to warn/block
 * turning on a second deferral that overlaps an already-active one. Ignores the
 * `fulfills_daily_rosary` flag itself so the caller controls which side is the
 * candidate; unbounded plans never overlap.
 */
export function deferralWindowsOverlap(a: SessionPlan, b: SessionPlan): boolean {
  const aStart = a.starts_on ?? a.date;
  const bStart = b.starts_on ?? b.date;
  if (!aStart || !bStart) return false;
  const aEnd = seriesEndDate(aStart, a.recurrence);
  const bEnd = seriesEndDate(bStart, b.recurrence);
  if (!aEnd || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
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

/** The built-in body used when a devotion/session names none. */
export const DEFAULT_MYSTERY_BODY = "reflection";

/**
 * The distinct bodies (versions) offered across a mystery set — e.g. the
 * reflection, the USCCB Scripture, an Ascension meditation. Deduped by
 * `body_key`, labelled for the "which body" picker, ordered by first appearance.
 */
export function mysteryBodiesForSet(
  db: Database,
  setId: ID,
): Array<{ key: string; label: string }> {
  const mysteryIds = new Set(mysteriesForSet(db, setId).map((m) => m.id));
  const seen = new Map<string, string>();
  for (const c of db.mystery_contents) {
    if (!mysteryIds.has(c.mystery_id)) continue;
    const key = c.body_key ?? DEFAULT_MYSTERY_BODY;
    if (seen.has(key)) continue;
    const source = c.source_id ? db.sources.find((s) => s.id === c.source_id) : undefined;
    seen.set(key, c.label ?? source?.name ?? "Reflection");
  }
  return [...seen].map(([key, label]) => ({ key, label }));
}

/**
 * The mystery bodies as editable "version" records — name taken from the body's
 * source (falling back to its label), plus how many mysteries it currently covers.
 * Powers the Mysteries authoring list.
 */
export function mysteryVersions(
  db: Database,
): Array<{ key: string; name: string; sourceId?: ID | undefined; count: number }> {
  const acc = new Map<string, { name: string; sourceId?: ID | undefined; ids: Set<ID> }>();
  for (const c of db.mystery_contents) {
    const key = c.body_key ?? DEFAULT_MYSTERY_BODY;
    const entry = acc.get(key);
    if (entry) {
      entry.ids.add(c.mystery_id);
      continue;
    }
    const source = c.source_id ? db.sources.find((s) => s.id === c.source_id) : undefined;
    acc.set(key, {
      name: source?.name ?? c.label ?? "Reflection",
      sourceId: c.source_id,
      ids: new Set([c.mystery_id]),
    });
  }
  return [...acc].map(([key, v]) => ({
    key,
    name: v.name,
    sourceId: v.sourceId,
    count: v.ids.size,
  }));
}

/** Every distinct body offered anywhere (across all sets), for the devotion-level picker. */
export function allMysteryBodies(db: Database): Array<{ key: string; label: string }> {
  const seen = new Map<string, string>();
  for (const c of db.mystery_contents) {
    const key = c.body_key ?? DEFAULT_MYSTERY_BODY;
    if (seen.has(key)) continue;
    const source = c.source_id ? db.sources.find((s) => s.id === c.source_id) : undefined;
    seen.set(key, c.label ?? source?.name ?? "Reflection");
  }
  return [...seen].map(([key, label]) => ({ key, label }));
}

export function mysteryContentFor(
  db: Database,
  mysteryId: ID,
  presentation: MysteryPresentation,
  bodyKey?: string,
): MysteryContent | undefined {
  if (presentation === "title_only") return undefined;
  const all = db.mystery_contents.filter((c) => c.mystery_id === mysteryId);
  const key = bodyKey ?? DEFAULT_MYSTERY_BODY;
  const pool = all.filter((c) => (c.body_key ?? DEFAULT_MYSTERY_BODY) === key);
  const src = pool.length ? pool : all;
  return (
    src.find((c) => c.variant === "short_description") ??
    src.find((c) => c.variant === "full_meditation") ??
    src[0]
  );
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
/* Song resolution                                                     */
/* ------------------------------------------------------------------ */

/** Fallback label for a song segment that carries none. */
export function songSegmentLabel(seg: { kind: string; ordinal: number }): string {
  if (seg.kind === "chorus") return "Chorus";
  if (seg.kind === "bridge") return "Bridge";
  return `Verse ${seg.ordinal}`;
}

/**
 * Resolve a song placement into a single sung step: the chosen segments joined
 * in the order requested (or the whole song when none are chosen). Falls back to
 * the version body for a song with no segments, so it degrades to a plain prayer.
 */
export function resolveSong(
  db: Database,
  prayerId: ID,
  ctx: SessionContext,
  templateVersionId?: ID,
  songSegments?: number[],
): { versionId?: ID | undefined; title: string; body: string; segmentLabels: string[] } {
  const resolved = resolvePrayerVersion(db, prayerId, ctx, templateVersionId);
  const version = db.prayer_versions.find((v) => v.id === resolved.versionId);
  const segments = version?.segments ?? [];
  if (segments.length === 0) return { ...resolved, segmentLabels: [] };

  const byOrdinal = new Map(segments.map((s) => [s.ordinal, s]));
  const chosen =
    songSegments && songSegments.length > 0
      ? songSegments.map((o) => byOrdinal.get(o)).filter((s): s is NonNullable<typeof s> => !!s)
      : [...segments].sort((a, b) => a.ordinal - b.ordinal);

  return {
    versionId: resolved.versionId,
    title: resolved.title,
    body: chosen.map((s) => s.body).join("\n\n"),
    segmentLabels: chosen.map((s) => s.label ?? songSegmentLabel(s)),
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

/**
 * Every media the user could pick under "How do you want to listen?" for one
 * template: the devotion's own audio, its prayers' clips, and any external-link
 * sources marked audio/video. Deduped by URL; order = template, then prayers,
 * then links. Empty when nothing playable is attached.
 */
export function listenSources(db: Database, template: PrayerTemplate): ListenSource[] {
  const items = db.template_items
    .filter((i) => i.template_id === template.id)
    .sort((a, b) => a.position - b.position);
  return listenSourcesFromItems(db, items, template.media ?? [], template.name);
}

/**
 * Listen sources drawn from an explicit item list (the session builder's live,
 * possibly-customized items) plus any base-template audio. Deduped by URL.
 */
export function listenSourcesFromItems(
  db: Database,
  items: TemplateItem[],
  baseMedia: import("./types").PrayerMedia[] = [],
  fallbackLabel = "Audio",
): ListenSource[] {
  const out: ListenSource[] = [];
  const seen = new Set<string>();
  const add = (s: ListenSource) => {
    if (!s.url || seen.has(s.url)) return;
    seen.add(s.url);
    out.push(s);
  };

  for (const m of baseMedia) {
    add({ url: m.url, kind: m.kind, label: m.label ?? fallbackLabel, source: m.source });
  }

  for (const item of items) {
    if (item.prayer_id) {
      const prayer = db.prayers.find((p) => p.id === item.prayer_id);
      for (const m of prayer?.media ?? []) {
        add({
          url: m.url,
          kind: m.kind,
          label: m.label ?? prayer?.title ?? "Prayer audio",
          source: m.source,
        });
      }
    }
    for (const opt of item.external_options ?? []) {
      if (opt.media_kind === "audio" || opt.media_kind === "video") {
        add({
          url: opt.url,
          kind: opt.media_kind,
          label: opt.label || item.label || "External audio",
        });
      }
    }
  }

  return out;
}

/** How deep `template_block` nesting may go before expansion stops (safety bound). */
export const MAX_BLOCK_DEPTH = 4;

interface MysteryConfig {
  mysteries: Mystery[];
  setId?: ID | undefined;
  setName?: string | undefined;
  presentation: MysteryPresentation;
  bodyKey: string;
}

/** Resolve which mystery set / body / presentation a single template prays. */
function resolveMysteryConfig(
  db: Database,
  template: PrayerTemplate,
  ctx: SessionContext,
): MysteryConfig {
  const presentation = ctx.mystery_presentation ?? template.mystery_presentation;
  const bodyKey = ctx.mystery_body ?? template.default_mystery_body ?? DEFAULT_MYSTERY_BODY;
  if (template.mystery_count <= 0) return { mysteries: [], presentation, bodyKey };
  // A template can pin its set (e.g. Luminous) unless the context chose one.
  const setCtx =
    !ctx.mystery_set_id && template.fixed_mystery_set_id
      ? { ...ctx, mystery_set_id: template.fixed_mystery_set_id }
      : ctx;
  const setId = resolveMysterySet(db, setCtx);
  const mysteries = setId ? mysteriesForSet(db, setId) : [];
  const setName = db.mystery_sets.find((s) => s.id === setId)?.name;
  return { mysteries, setId, setName, presentation, bodyKey };
}

/** Mutable accumulator threaded through recursive template-block expansion. */
interface CompileState {
  db: Database;
  ctx: SessionContext;
  sessionId: ID;
  items: SessionItem[];
  position: number;
  /** Template ids on the current recursion path — a block re-referencing one is skipped. */
  stack: ID[];
  /** First mystery set any expanded template resolved (for session.context). */
  effectiveMysterySet?: ID | undefined;
}

export function generatePrayerSession(
  db: Database,
  template: PrayerTemplate,
  contextInput: Partial<SessionContext> = {},
): GeneratedSession {
  const ctx = defaultContext(contextInput);

  // Reflect the root template's mystery choices back onto the returned context
  // (existing behavior). Nested blocks resolve their own config as they expand.
  const rootCfg = resolveMysteryConfig(db, template, ctx);
  ctx.mystery_presentation = rootCfg.presentation;
  ctx.mystery_body = rootCfg.bodyKey;
  if (rootCfg.setId) ctx.mystery_set_id = rootCfg.setId;

  const state: CompileState = {
    db,
    ctx,
    sessionId: newId("session"),
    items: [],
    position: 0,
    stack: [template.id],
  };
  expandTemplate(state, template, 0);

  // A composite whose root has no mysteries but nests a rosary block: surface the
  // block's set on the context so UI reading it still names the mysteries.
  if (!ctx.mystery_set_id && state.effectiveMysterySet) {
    ctx.mystery_set_id = state.effectiveMysterySet;
  }

  const session: PrayerSession = {
    id: state.sessionId,
    template_id: template.id,
    title: template.name,
    context: ctx,
    created_at: new Date().toISOString(),
    cursor: 0,
  };

  return { session, items: state.items };
}

/**
 * Expand one template's items into session items, recursing into any
 * `template_block`. `depth` bounds nesting; `state.stack` blocks circular refs.
 * A nested rosary block resolves its own mysteries and counts its own decades.
 */
function expandTemplate(state: CompileState, template: PrayerTemplate, depth: number): void {
  const { db, ctx } = state;
  const { mysteries, setId, setName, presentation, bodyKey } = resolveMysteryConfig(
    db,
    template,
    ctx,
  );
  if (setId && !state.effectiveMysterySet) state.effectiveMysterySet = setId;
  let decade = 0; // increments at each mystery so Hail Marys can show "1st decade" etc.

  const push = (
    item: Omit<
      SessionItem,
      "id" | "session_id" | "position" | "progress_mode" | "completion_status" | "completion_method"
    >,
  ) => {
    // Dedication substitution: prayer text may carry {name}/{subj}/{obj}/{poss}/{us}
    // tokens that resolve to the soul this session is prayed for (or the plural
    // "the faithful departed" fallback). Applies to the visible strings.
    const dedication = ctx.for_whom;
    state.items.push({
      id: newId("item"),
      session_id: state.sessionId,
      position: state.position++,
      progress_mode: ctx.progress_mode,
      completion_status: "pending",
      completion_method: null,
      source_template_id: template.id,
      ...item,
      title: substituteDedication(item.title, dedication),
      ...(item.body !== undefined ? { body: substituteDedication(item.body, dedication) } : {}),
    });
  };

  const templateItems = db.template_items
    .filter((i) => i.template_id === template.id)
    .sort((a, b) => a.position - b.position);

  for (const item of templateItems) {
    // 3. Conditional content.
    if (item.condition_tag && !ctx.condition_tags.includes(item.condition_tag)) continue;
    if (item.optional && !ctx.include_optional) continue;

    // Nested template: expand its items inline. Guards circular nesting (a block
    // re-referencing an ancestor is skipped) and bounds depth. An optional label
    // becomes a section heading introducing the block.
    if (item.kind === "template_block") {
      const blockId = item.block_template_id;
      if (!blockId || state.stack.includes(blockId) || depth >= MAX_BLOCK_DEPTH) continue;
      const block = db.templates.find((t) => t.id === blockId);
      if (!block) continue;
      if (item.label) push({ kind: "heading", title: item.label });
      state.stack.push(blockId);
      expandTemplate(state, block, depth + 1);
      state.stack.pop();
      continue;
    }

    if (item.kind === "heading") {
      push({ kind: "heading", title: item.label ?? "" });
      continue;
    }

    // Salutations are prayed like prayers. Either a V/R pair or plain text.
    if (item.kind === "salutation") {
      const isVR = item.salutation_vr ?? Boolean(item.versicle || item.response);
      const body = isVR
        ? [item.versicle ? `V. ${item.versicle}` : "", item.response ? `R. ${item.response}` : ""]
            .filter(Boolean)
            .join("\n")
        : (item.body ?? "");
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

    if (item.kind === "petition" || item.kind === "meditation") {
      push({
        kind: item.kind,
        title: item.label ?? (item.kind === "petition" ? "Petition" : "Meditation"),
        body: item.body ?? "",
      });
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

    // A journaling step: `body` is the prompt, `label` names the movement. The
    // user's written response is captured in Prayer Mode and saved as a linked
    // Reflection (see `saveSessionReflection`), stored on the item's
    // `configuration` so re-opening the session shows what was written.
    if (item.kind === "reflection") {
      push({
        kind: "reflection",
        title: item.label ?? "Reflection",
        body: item.body ?? "",
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
        body: item.body ?? intention?.body ?? intention?.title ?? "",
      });
      continue;
    }

    if (item.kind === "mystery_placeholder") {
      const ordinal = item.mystery_ordinal ?? 1;
      const mystery = mysteries[ordinal - 1];
      if (!mystery) continue;
      decade = ordinal;
      const content = mysteryContentFor(db, mystery.id, presentation, bodyKey);
      const hideText = presentation === "title_only";
      push({
        kind: "mystery",
        title: mystery.title,
        // body is the *description* of the mystery (may be empty for a
        // Scripture-only version); the exact passage rides in configuration.
        body: hideText ? undefined : content?.body || undefined,
        reference: content?.scripture_ref,
        mystery_id: mystery.id,
        mystery_content_id: content?.id,
        mystery_ordinal: ordinal,
        configuration: {
          presentation,
          set_name: setName,
          decade,
          fruit: content?.fruit,
          scripture_ref: content?.scripture_ref,
          scripture_text: hideText ? undefined : content?.scripture_text,
          heading:
            `${ordinalWord(ordinal)} ${setName?.replace(" Mysteries", "") ?? ""} Mystery`.trim(),
        },
      });
      continue;
    }

    // A song is one sung step: the chosen verses/chorus (or the whole song),
    // never expanded by repetition. Completion tracks the one step.
    if (item.kind === "song") {
      if (!item.prayer_id) continue;
      const song = resolveSong(db, item.prayer_id, ctx, item.prayer_version_id, item.song_segments);
      push({
        kind: "song",
        title: song.title,
        body: song.body,
        prayer_id: item.prayer_id,
        prayer_version_id: song.versionId,
        configuration: {
          // Only label the parts when the placement sings a chosen subset — a
          // whole-song step just reads "Song".
          ...(item.song_segments?.length && song.segmentLabels.length
            ? { segment_labels: song.segmentLabels }
            : {}),
          ...(decade > 0 ? { decade } : {}),
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
        // The mystery's set of beads — label those Hail Marys with the decade.
        ...(decade > 0 && total > 1 ? { configuration: { decade } } : {}),
      });
    }
  }

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
    (i) =>
      i.kind === "prayer" ||
      i.kind === "song" ||
      i.kind === "mystery" ||
      i.kind === "external_link" ||
      // A reflection is an action the user takes (writing a response), so it
      // counts toward progress — it's completed by saving, or by skipping.
      i.kind === "reflection",
  );
  return {
    done: prayable.filter((i) => i.completion_status === "complete").length,
    total: prayable.length,
  };
}

/**
 * Estimate how long a compiled session takes to pray, in whole minutes.
 * Model: recited prayer runs ~180 words/min, plus a few seconds per step to
 * announce and transition. Calibrated so a full five-decade Rosary lands near
 * ~20 min. The app derives this — users never type it.
 */
export function estimateMinutes(items: SessionItem[]): number {
  const WORDS_PER_MIN = 180;
  const OVERHEAD_SEC_PER_ITEM = 3;
  const words = (t?: string) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);
  const seconds = items.reduce(
    (sum, it) => sum + (words(it.body) / WORDS_PER_MIN) * 60 + OVERHEAD_SEC_PER_ITEM,
    0,
  );
  return items.length === 0 ? 0 : Math.max(1, Math.round(seconds / 60));
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
      if (i.kind === "template_block") {
        const block = db.templates.find((t) => t.id === i.block_template_id);
        return { label: i.label || block?.name || "Devotion block", detail: "Devotion block" };
      }
      if (i.kind === "external_link") {
        const opts = i.external_options ?? [];
        const def = opts.find((o) => o.is_default) ?? opts[0];
        return { label: i.label ?? "External link", detail: def?.label };
      }
      if (i.kind === "scripture")
        return { label: i.reference ?? "Scripture", detail: i.body?.slice(0, 60) };
      if (i.kind === "song") {
        const song = db.prayers.find((p) => p.id === i.prayer_id);
        const version = db.prayer_versions.find(
          (v) => v.id === (i.prayer_version_id ?? song?.default_version_id),
        );
        const segs = version?.segments ?? [];
        const chosen =
          i.song_segments && i.song_segments.length
            ? i.song_segments
                .map((o) => segs.find((s) => s.ordinal === o))
                .filter((s): s is NonNullable<typeof s> => !!s)
            : [];
        return {
          label: song?.title ?? "Song",
          detail: chosen.length
            ? chosen.map((s) => s.label ?? songSegmentLabel(s)).join(" · ")
            : segs.length
              ? "Whole song"
              : undefined,
        };
      }
      if (i.kind !== "prayer") return { label: i.label ?? i.kind };
      const prayer = db.prayers.find((p) => p.id === i.prayer_id);
      return {
        label: prayer?.title ?? "Prayer",
        detail: i.repetition_count > 1 ? `× ${i.repetition_count}` : undefined,
      };
    });
}
