import { todayISO } from "./compiler";
import { resolveInspirations } from "./inspiration";
import { SEED_EPOCH } from "./seed";
import {
  CATEGORY_LABELS,
  contentTitle,
  hasStatus,
  isQuote,
  quoteBody,
  statusLabel,
} from "./knowledge";
import type {
  Database,
  Intention,
  KnowledgeItem,
  MassExperience,
  PrayerSession,
  Reflection,
} from "./types";

/**
 * ACTS-157 — build one Markdown document the user pastes into ChatGPT or Claude
 * to surface patterns across their devotional life.
 *
 * Everything here is **pure over `db`** and read-only: the export never mutates
 * the store and never leaves the device. The caller downloads it or copies it;
 * where it goes after that is the user's choice, which the export screen says
 * out loud.
 *
 * This is deliberately *not* ACTS-113 (in-app grounded Insights → Wisdom). It
 * ships the value with no AI in the product at all.
 */

/** An inclusive `yyyy-mm-dd` window. `null` on either end = unbounded. */
export interface ExportRange {
  from: string | null;
  to: string | null;
}

/** Everything, start to today. */
export const ALL_TIME: ExportRange = { from: null, to: null };

/**
 * The window for "since my last export" — everything from the **day** of the
 * last export forward, open-ended at the near end.
 *
 * ⚠️ It deliberately starts *on* that day, not the day after. Ranges here are
 * date-granular, and the export is stamped with a moment in time: someone who
 * exported on Thursday morning and journaled Thursday night would lose that
 * entry forever if the window opened on Friday. Starting on the day re-sends at
 * most a few same-day entries — harmless to read twice, unlike a silent gap.
 *
 * Returns `null` when nothing has ever been exported, which is what hides the
 * option on the screen.
 */
export function sinceLastExport(lastExportAt: string | undefined): ExportRange | null {
  if (!lastExportAt) return null;
  return { from: dayOf(lastExportAt), to: null };
}

export interface JourneyExportOptions {
  range?: ExportRange;
  /** The instruction block written into the top of the file. Defaults to `DEFAULT_INSIGHT_PROMPT`. */
  prompt?: string;
  /** The export date, `yyyy-mm-dd`. Injectable so the harness is deterministic. */
  today?: string;
}

export interface ExportCounts {
  reflections: number;
  sessions: number;
  intentions: number;
  masses: number;
  knowledge: number;
  total: number;
}

export interface JourneyExport {
  markdown: string;
  filename: string;
  /** Human-readable description of the window covered ("Everything — 2026-01-04 to 2026-09-04"). */
  rangeLabel: string;
  counts: ExportCounts;
  characters: number;
  /** True when the document is long enough that it may not fit in one chat. */
  oversized: boolean;
}

/**
 * Past this many characters a single paste starts to strain a chat context
 * (~4 chars per token, so roughly 50k tokens). Not a hard limit — the screen
 * warns and suggests narrowing the range rather than blocking the export.
 */
export const OVERSIZE_CHARS = 200_000;

/**
 * The prompt written into the top of the document, so the user pastes one thing
 * instead of composing instructions themselves. Shown (and editable) on the
 * export screen.
 *
 * The guardrails are not decoration — the PRD is explicit that this app must
 * never present itself as speaking for God or hand down discernment (§1A/3/28/32,
 * ACTS-113). An assistant reading this record has to be told the same.
 */
export const DEFAULT_INSIGHT_PROMPT = `You are helping me look back over my own faith journey.

Everything below this prompt is my own record, exported from a personal devotional app: journal reflections in my own words, the prayers and devotions I actually prayed, the intentions I was carrying, notes from Mass, and what I was reading or studying. Nothing in it was written for an audience — it is a private record.

Please read it as a whole and tell me what you notice:

1. **Recurring threads** — themes, words, images, people, or Scripture that keep coming back.
2. **Movement over time** — what shifted between the start of this period and the end. Where did something loosen, deepen, harden, or heal?
3. **Open questions** — what I keep circling without resolving.
4. **What went quiet** — practices, people, or concerns that were present early and then dropped away.
5. **Rhythm** — what the pattern of prayer says about the seasons in this period: consistency, gaps, what I turn to when things are hard.
6. **What to bring to prayer next** — a few questions I could sit with, drawn from what is actually here.

How to answer:

- **Ground every observation.** Cite the date and the entry it came from, and quote my own words where you can. If you are inferring, say so.
- **Do not tell me what God is saying to me, and do not tell me what to decide.** Name what you see and ask me questions. The discerning is mine to do.
- Do not flatter me, and do not soften a pattern to be encouraging. If something looks avoided or unresolved, say so plainly and kindly.
- Say when there is not enough here to go on, rather than filling the gap.

Start with the two or three things that struck you most, then work through the sections above.`;

/* ---------------------------------------------------------------- dates --- */

/**
 * The calendar date something is filed under, `yyyy-mm-dd`, **in the user's own
 * timezone**.
 *
 * ⚠️ Not `iso.slice(0, 10)`. The store writes `created_at` as UTC
 * (`new Date().toISOString()`), so an entry journaled at 8pm Pacific is stored
 * on the *following* UTC day — slicing would file it under tomorrow, out of step
 * with every date the app shows and with the local dates the range picker hands
 * back. Same trap `todayISO()` documents in `compiler.ts`.
 *
 * A value that is already a plain calendar date (`MassExperience.date`,
 * `KnowledgeItem.start_date`) is returned as written: parsing it would read it as
 * UTC midnight and shift it a day backwards in negative-offset zones.
 */
function dayOf(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function inRange(day: string, range: ExportRange): boolean {
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

/**
 * Which date filters which layer — decided per layer, and stated in the document
 * so a reader isn't misled:
 *
 * - `Reflection` / `PrayerSession` / `Intention` — `created_at`, which is when it
 *   happened.
 * - `MassExperience` — its own `date` (the day of the Mass), **not** `created_at`,
 *   which is only when the note was typed up.
 * - `KnowledgeItem` — `created_at` is when the item was *saved to the library*,
 *   not when it was read. A book saved in January and finished in June sits in
 *   January. Programs also carry `start_date`, which is used when present.
 */
export function dayOfReflection(r: Reflection): string {
  return dayOf(r.created_at);
}
export function dayOfSession(s: PrayerSession): string {
  return dayOf(s.created_at);
}
export function dayOfIntention(i: Intention): string {
  return dayOf(i.created_at);
}
export function dayOfMass(m: MassExperience): string {
  return m.date || dayOf(m.created_at);
}
export function dayOfKnowledge(k: KnowledgeItem): string {
  return k.start_date || dayOf(k.created_at);
}

/**
 * Whether a record came pre-installed with the app rather than from the user.
 * Every seeded row carries `SEED_EPOCH` verbatim; a real record is stamped with
 * the actual moment, which can never equal it.
 */
export function isSeeded(createdAt: string | undefined): boolean {
  return createdAt === SEED_EPOCH;
}

/**
 * Earliest and latest day the **user** recorded something — the anchor for the
 * "Everything" label and the date picker's opening value.
 *
 * Pre-installed library items are excluded on purpose. They all carry the seed
 * epoch, so counting them told a brand-new user their journey began in 2023 —
 * a date that is really the app's install stamp, not anything they did.
 */
export function journeyDateBounds(db: Database): { first: string | null; last: string | null } {
  const days = [
    ...db.reflections.filter((r) => !isSeeded(r.created_at)).map(dayOfReflection),
    ...db.sessions.filter((s) => !isSeeded(s.created_at)).map(dayOfSession),
    ...db.intentions.filter((i) => !isSeeded(i.created_at)).map(dayOfIntention),
    ...db.mass_experiences.filter((m) => !isSeeded(m.created_at)).map(dayOfMass),
    ...db.knowledge_items.filter((k) => !isSeeded(k.created_at)).map(dayOfKnowledge),
  ]
    .filter((d) => Boolean(d))
    .sort();
  const first = days[0];
  const last = days[days.length - 1];
  return { first: first ?? null, last: last ?? null };
}

function describeRange(db: Database, range: ExportRange, today: string): string {
  const bounds = journeyDateBounds(db);
  if (!range.from && !range.to) {
    return bounds.first
      ? `Everything — ${bounds.first} to ${today}`
      : "Everything (nothing recorded yet)";
  }
  const from = range.from ?? bounds.first ?? "the beginning";
  const to = range.to ?? today;
  return `${from} to ${to}`;
}

/* --------------------------------------------------------------- markdown - */

/** Drop empty/undefined parts and join with a separator. */
function join(parts: (string | undefined | null | false)[], sep = " · "): string {
  return parts.filter((p): p is string => Boolean(p && String(p).trim())).join(sep);
}

/** Normalize a user body for the document: trim, and keep its own line breaks. */
function bodyBlock(text: string): string {
  return text.trim();
}

function reflectionSection(db: Database, items: Reflection[]): string[] {
  const out: string[] = [`## Reflections and journal (${items.length})`, ""];
  if (items.length === 0) {
    out.push("_None in this range._", "");
    return out;
  }
  for (const r of items) {
    const title = r.title?.trim() || "Untitled";
    out.push(`### ${dayOfReflection(r)} — ${title}`);

    const meta: string[] = [];
    if (r.themes?.length) meta.push(`Themes: ${r.themes.join(", ")}`);
    const inspirations = resolveInspirations(r.links ?? [], db);
    if (inspirations.length > 0) {
      meta.push(
        `Written after: ${inspirations.map((i) => join([i.label, i.detail], " — ")).join("; ")}`,
      );
    }
    if (r.mode === "spoken") meta.push("Captured by voice");
    if (r.photo_count > 0) {
      meta.push(
        `${r.photo_count} photo${r.photo_count === 1 ? "" : "s"} (not included — images can't be exported as text)`,
      );
    }
    if (meta.length > 0) out.push(`*${meta.join(" · ")}*`);

    out.push("", bodyBlock(r.body), "");

    // A pasted passage or quote the entry was written against is part of the
    // reflection's meaning, so carry it rather than only naming it.
    for (const i of inspirations) {
      if (i.text?.trim()) out.push(`> ${i.text.trim().split("\n").join("\n> ")}`, "");
    }
  }
  return out;
}

function sessionSection(db: Database, items: PrayerSession[]): string[] {
  const out: string[] = [`## Prayers and devotions prayed (${items.length})`, ""];
  if (items.length === 0) {
    out.push("_None in this range._", "");
    return out;
  }
  out.push(
    "_The prayer texts themselves are not included — they are common prayers, not my words. What matters here is what was prayed and when._",
    "",
  );
  for (const s of items) {
    const state = s.completed_at ? "completed" : "not finished";
    const where = s.external_app ? `prayed in ${s.external_app}` : undefined;
    out.push(`- **${dayOfSession(s)}** — ${s.title || "Devotion"} (${join([state, where])})`);
  }
  out.push("");
  return out;
}

function intentionSection(items: Intention[]): string[] {
  const out: string[] = [`## Intentions I was carrying (${items.length})`, ""];
  if (items.length === 0) {
    out.push("_None in this range._", "");
    return out;
  }
  for (const i of items) {
    out.push(
      `- **${dayOfIntention(i)}** — ${i.title}${i.body?.trim() ? `: ${i.body.trim()}` : ""}`,
    );
  }
  out.push("");
  return out;
}

function massSection(items: MassExperience[]): string[] {
  const out: string[] = [`## Mass (${items.length})`, ""];
  if (items.length === 0) {
    out.push("_None in this range._", "");
    return out;
  }
  for (const m of items) {
    const where = join([m.church, m.location, m.mass_time]);
    out.push(`### ${dayOfMass(m)}${where ? ` — ${where}` : ""}`);
    if (m.celebrant?.trim()) out.push(`*Celebrant: ${m.celebrant.trim()}*`);
    if (m.notes?.trim()) out.push("", bodyBlock(m.notes));
    if (m.transcript?.trim() && m.transcript_status === "ready") {
      out.push("", "**Homily (transcribed):**", "", bodyBlock(m.transcript));
    } else if (m.audio_url) {
      out.push(
        "",
        "_An audio recording exists for this Mass but audio can't be exported as text._",
      );
    }
    out.push("");
  }
  return out;
}

function knowledgeSection(db: Database, items: KnowledgeItem[]): string[] {
  const out: string[] = [`## What I was reading and studying (${items.length})`, ""];
  if (items.length === 0) {
    out.push("_None in this range._", "");
    return out;
  }
  for (const k of items) {
    const voice = k.voice_id ? db.voices.find((v) => v.id === k.voice_id)?.name : undefined;
    const by = voice ?? k.creator ?? k.source;
    const status = hasStatus(k.category) ? statusLabel(k.status) : undefined;
    const dates = join([
      k.start_date && `started ${k.start_date}`,
      k.target_date && `target ${k.target_date}`,
    ]);
    // A quote has no title of its own — the app shows a trimmed snippet as its
    // label. Repeating that snippet as a heading above the full text would just
    // say the same thing twice, so a quote is headed by its kind and carries its
    // text below. Everything else keeps its real title.
    const heading = isQuote(k) ? "Quote" : contentTitle(k);
    // A pre-installed item's only date is the app's install stamp, which says
    // nothing about the reader — so it is headed by name alone.
    const seeded = isSeeded(k.created_at);
    out.push(
      seeded ? `### ${heading}` : `### ${dayOfKnowledge(k)} — ${heading}`,
      `*${join([
        CATEGORY_LABELS[k.category],
        by && `by ${by}`,
        status,
        dates,
        // Kept, not dropped — someone may genuinely be working through a
        // pre-installed program — but flagged so it is never read as a choice
        // the user made, or as evidence of what they were drawn to.
        isSeeded(k.created_at) && "came with the app, not chosen",
      ])}*`,
    );
    // Only a quote has a body. `quoteBody` falls back to the title for legacy
    // safety, which would otherwise print every book's title back as a quotation.
    const quote = isQuote(k) ? quoteBody(k) : "";
    if (quote.trim()) out.push("", `> ${quote.trim().split("\n").join("\n> ")}`);
    if (k.notes?.trim()) out.push("", `My note: ${k.notes.trim()}`);
    if (k.tags?.length) out.push("", `Tags: ${k.tags.join(", ")}`);
    out.push("");
  }
  return out;
}

/* ----------------------------------------------------------------- build --- */

/**
 * Build the export. Sections run oldest → newest so movement over time reads in
 * the order it happened.
 */
export function buildJourneyExport(db: Database, opts: JourneyExportOptions = {}): JourneyExport {
  const range = opts.range ?? ALL_TIME;
  const today = opts.today ?? todayISO();
  const prompt = (opts.prompt ?? DEFAULT_INSIGHT_PROMPT).trim();

  const byDay =
    <T>(day: (t: T) => string) =>
    (a: T, b: T) =>
      day(a).localeCompare(day(b));

  const reflections = db.reflections
    .filter((r) => inRange(dayOfReflection(r), range))
    .sort(byDay(dayOfReflection));
  const sessions = db.sessions
    .filter((s) => inRange(dayOfSession(s), range))
    .sort(byDay(dayOfSession));
  const intentions = db.intentions
    .filter((i) => inRange(dayOfIntention(i), range))
    .sort(byDay(dayOfIntention));
  const masses = db.mass_experiences
    .filter((m) => inRange(dayOfMass(m), range))
    .sort(byDay(dayOfMass));
  const knowledge = db.knowledge_items
    .filter((k) => inRange(dayOfKnowledge(k), range))
    .sort(byDay(dayOfKnowledge));

  const counts: ExportCounts = {
    reflections: reflections.length,
    sessions: sessions.length,
    intentions: intentions.length,
    masses: masses.length,
    knowledge: knowledge.length,
    total:
      reflections.length + sessions.length + intentions.length + masses.length + knowledge.length,
  };

  const rangeLabel = describeRange(db, range, today);

  const lines: string[] = [
    "# My faith journey",
    "",
    `*A personal devotional record. Period covered: ${rangeLabel}. Exported ${today}.*`,
    "",
    "---",
    "",
    "## Read this first",
    "",
    prompt,
    "",
    "---",
    "",
    "## What is in this file",
    "",
    `- **Period covered:** ${rangeLabel}`,
    `- **Reflections and journal entries:** ${counts.reflections}`,
    `- **Prayers and devotions prayed:** ${counts.sessions}`,
    `- **Intentions:** ${counts.intentions}`,
    `- **Masses:** ${counts.masses}`,
    `- **Reading and study:** ${counts.knowledge}`,
    "",
    "**How things were dated.** Reflections, prayers and intentions are filed by when they were recorded. A Mass is filed by the day it was attended. A book, program or other saved item is filed by when it was *saved to the library* (or its start date, when it has one) — not by when it was finished, so something saved early and read for months appears at its start.",
    "",
    "**What is not here.** Photos and audio recordings cannot be exported as text; where one exists it is named but not included. The text of common prayers is not included either — those are the Church's words, not mine.",
    "",
    "---",
    "",
  ];

  if (counts.total === 0) {
    lines.push("_There is nothing recorded in this period._", "");
  } else {
    lines.push(
      ...reflectionSection(db, reflections),
      ...sessionSection(db, sessions),
      ...intentionSection(intentions),
      ...massSection(masses),
      ...knowledgeSection(db, knowledge),
    );
  }

  const markdown =
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n";

  const stamp = range.from || range.to ? `${range.from ?? "start"}-to-${range.to ?? today}` : today;

  return {
    markdown,
    filename: `oravia-journey-${stamp}.md`,
    rangeLabel,
    counts,
    characters: markdown.length,
    oversized: markdown.length > OVERSIZE_CHARS,
  };
}
