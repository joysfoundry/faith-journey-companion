/**
 * Deterministic import analysis: UPLOAD -> ANALYZE -> PROPOSE -> REVIEW -> SAVE.
 *
 * This module only *proposes* classifications. Nothing is saved until the user
 * confirms on the Import Review screen. AI can later replace `analyzeText`
 * without changing any consumer.
 */
import type {
  Database,
  ExpressionType,
  PrayerType,
  ImportCandidate,
  ImportClassification,
  ImportDraft,
  Recurrence,
  Source,
} from "./types";
import { newId } from "./compiler";

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, "fifty-four": 54,
};

/**
 * Detect a devotion's default recurrence from its text, with no AI — an explicit
 * "N-day" / "N days" (or a spelled-out number + "day(s)") becomes `daily × N`; a
 * bare "novena" with no number defaults to 9 days. The result is a starting
 * point the user edits on the review screen. Returns undefined when nothing
 * suggests a repeat.
 */
export function detectRecurrence(text: string): Recurrence | undefined {
  const blob = text.toLowerCase();
  // "54-day", "54 day", "9-day novena", "for 30 days"
  const numeric = blob.match(/\b(\d{1,3})[\s-]*day\b/);
  if (numeric) {
    const n = Number(numeric[1]);
    if (n >= 2 && n <= 366) return { freq: "daily", interval: 1, count: n };
  }
  // Spelled-out: "nine day novena", "fifty-four days"
  const word = blob.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|forty|fifty|fifty-four)[\s-]*days?\b/,
  );
  if (word?.[1] && NUMBER_WORDS[word[1]]) {
    return { freq: "daily", interval: 1, count: NUMBER_WORDS[word[1]] };
  }
  // Bare "novena" implies the traditional nine days.
  if (/\bnovena\b/.test(blob)) return { freq: "daily", interval: 1, count: 9 };
  return undefined;
}

const INSTRUCTION_HINTS = [
  /\bsay\b.*\b(one|two|three|ten|\d+)\b/i,
  /\brepeat\b/i,
  /\bbegin\b.*\bwith\b/i,
  /\bafter each decade\b/i,
  /\bhow to\b/i,
  /\bthen (pray|say)\b/i,
];

const MYSTERY_HINTS = [/\bmyster(y|ies)\b/i, /\b(joyful|sorrowful|glorious|luminous)\b/i];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Jaccard similarity over word sets — cheap, deterministic, good enough. */
export function similarity(a: string, b: string): number {
  const setA = new Set(normalize(a).split(" ").filter(Boolean));
  const setB = new Set(normalize(b).split(" ").filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  setA.forEach((w) => {
    if (setB.has(w)) shared++;
  });
  return shared / (setA.size + setB.size - shared);
}

/** Devotional language markers — used to keep prose out of the prayer library. */
const PRAYER_HINTS = [
  /\bamen\b/i,
  /\bpray for us\b/i,
  /\b(o|holy|blessed|almighty) (god|lord|father|mary|queen|michael|spirit)\b/i,
  /\bhail\b/i,
  /\bthy\b|\bthee\b|\bthou\b/i,
  /\bwe beseech\b|\bgrant us\b|\bhave mercy\b|\bdeliver us\b/i,
  /\bglory be\b|\blord,? /i,
];

function classify(title: string, body: string): { classification: ImportClassification; confidence: number } {
  const blob = `${title}\n${body}`;
  const devotional = PRAYER_HINTS.filter((r) => r.test(blob)).length;

  if (MYSTERY_HINTS.some((r) => r.test(title)))
    return { classification: "mystery", confidence: 0.6 };
  if (/^the .+ mystery/i.test(title)) return { classification: "mystery_meditation", confidence: 0.6 };
  if (INSTRUCTION_HINTS.filter((r) => r.test(blob)).length >= 2 && devotional === 0)
    return { classification: "how_to", confidence: 0.75 };
  if (/\bamen\b/i.test(body) && devotional >= 2) return { classification: "prayer", confidence: 0.9 };
  if (devotional >= 2) return { classification: "prayer", confidence: 0.6 };
  if (INSTRUCTION_HINTS.some((r) => r.test(blob)))
    return { classification: "how_to", confidence: 0.5 };
  // No devotional language at all: prose, notes, or document scaffolding.
  return { classification: "source_material", confidence: 0.3 };
}

/** Page furniture that carries no prayer text (audio players, bead markers, labels). */
const NOISE_LINE = [
  /^latin$/i,
  /^english$/i,
  /^[○●•◦*\-\s]+$/,
  /^audio player$/i,
  /^\d{1,2}:\d{2}$/,
  /^use up\/down arrow keys/i,
  /^(share|print|tweet|advertisement|comments?|related posts?)$/i,
];

/** Rubric / instruction lines: versicles, responses, and repetition shorthand. */
const RUBRIC_LINE = [
  /^[VR]\s*\/?\s*\.?\s*[:.]?\s+\S/,
  /^(v|r)\/\.?/i,
  /\(\s*\d{1,2}\s*x\s*\)/i,
  /^(our father|hail mary|glory be|pater noster|ave maria|gloria patri)\b[^.]{0,80}$/i,
  /^in honou?r of\b/i,
  /^\(?\d{2,3} days,/i,
  /^(repeat|say|then (pray|say)|pray)\b.{0,80}$/i,
  /^(one|two|three|five|seven|ten|twelve)\s+.{0,60}\b(our father|hail mar|glory be|pater|ave|gloria)\b/i,
];

function isNoise(line: string): boolean {
  return !line || NOISE_LINE.some((r) => r.test(line));
}

function isRubricLine(line: string): boolean {
  return RUBRIC_LINE.some((r) => r.test(line));
}

/**
 * Separates a block's devotional wording from the rubric lines printed around it
 * (V/. and R/. versicles, "Our Father … (3x)"). The rubric becomes a how-to so
 * the prayer body stays clean.
 */
export function splitRubric(body: string): { prose: string; rubric: string } {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const prose: string[] = [];
  const rubric: string[] = [];
  for (const line of lines) {
    if (isRubricLine(line) && line.length <= 160) rubric.push(line);
    else prose.push(line);
  }
  return { prose: prose.join("\n").trim(), rubric: rubric.join("\n").trim() };
}

/** Splits raw text into titled blocks using heading-ish lines (markdown aware). */
export function splitBlocks(raw: string): Array<{ title: string; body: string }> {
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\*\*/g, "").replace(/^\*|\*$/g, "").trim())
    .filter((l) => !/^\s*(-{3,}|={3,}|`{3,})\s*$/.test(l))
    .filter((l) => !isNoise(l));

  const blocks: Array<{ title: string; body: string[] }> = [];
  const isHeading = (line: string) => {
    const t = line.trim();
    if (!t) return false;
    if (/^#{1,6}\s+/.test(t)) return true;
    // "How to pray the Chaplet of St. Michael" heads an instruction section.
    if (t.length <= 90 && isExplicitHowTo(t)) return true;
    if (t.length > 80) return false;
    if (/^\d+$/.test(t)) return false;
    if (/^[->*|]/.test(t)) return false;
    if (isRubricLine(t)) return false;
    const letters = t.replace(/[^A-Za-z]/g, "");
    if (!letters) return false;
    // Booklet-style label: "First Salutation:", "Concluding Prayer (on Medal):"
    if (/:$/.test(t) && t.split(/\s+/).length <= 10) return true;
    const upperRatio = letters.split("").filter((c) => c === c.toUpperCase()).length / letters.length;
    if (upperRatio > 0.85) return true;
    // Title-case headline with no sentence punctuation: "August Queen of Heaven Prayer"
    if (!/[.!?;,]$/.test(t)) {
      const words = t.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
      if (words.length >= 2 && words.length <= 12) {
        const capped = words.filter((w) => /^[A-Z0-9(“"']/.test(w)).length;
        if (capped / words.length >= 0.7) return true;
      }
    }
    return false;
  };

  for (const line of lines) {
    if (isHeading(line)) {
      blocks.push({ title: line.trim().replace(/^#{1,6}\s+/, "").replace(/:$/, ""), body: [] });
    } else if (line.trim()) {
      if (blocks.length === 0) blocks.push({ title: "Untitled excerpt", body: [] });
      blocks[blocks.length - 1]!.body.push(line.trim().replace(/^[>\-*]\s+/, ""));
    }
  }

  return blocks
    .map((b) => ({ title: titleCase(b.title).replace(/\s+/g, " ").trim(), body: b.body.join("\n").trim() }))
    .filter((b) => b.body.length > 0);
}



function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 2 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Proposes the two taxonomy axes for a candidate. Purely deterministic hints —
 * the user can change both on the review screen.
 */
export function proposeTaxonomy(
  title: string,
  body: string,
  classification: ImportClassification,
): { prayer_type: PrayerType; expression_type: ExpressionType } {
  const blob = `${title}\n${body}`;
  const expression_type: ExpressionType =
    classification === "mystery_meditation" || classification === "mystery"
      ? "meditation"
      : /\b(psalm|gospel|reading|scripture|chapter \d+)\b/i.test(blob)
        ? "scripture"
        : "vocal";
  const prayer_type: PrayerType = /\b(creed|our father|glory be|liturgy|mass|psalm|collect)\b/i.test(
    blob,
  )
    ? "liturgical"
    : /\b(hail mary|rosary|sign of the cross|angelus)\b/i.test(blob)
      ? "traditional_expression"
      : "devotional";
  return { prayer_type, expression_type };
}

/**
 * Explicit "how to" wording. Without AI we never guess: a block becomes a How To
 * only when it literally announces itself as instructions.
 */
const EXPLICIT_HOW_TO = [
  /\bhow to (pray|say|recite|use)\b/i,
  /\bhow the .{0,30}is prayed\b/i,
  /\b(instructions|directions)\b/i,
  /\b(manner|method|order|way) of (praying|saying|reciting)\b/i,
  /\bto pray (this|the) (chaplet|novena|rosary|devotion)\b/i,
  /\bpraying the .{0,30}\b(step|steps)\b/i,
];

export function isExplicitHowTo(title: string, body = ""): boolean {
  const head = `${title}\n${body.split("\n").slice(0, 3).join("\n")}`;
  return EXPLICIT_HOW_TO.some((r) => r.test(head));
}

/** Comment timestamps, dates, and other page furniture that isn't prayer text. */
const JUNK_TITLE = [
  /^\d{1,2}(st|nd|rd|th)?\s+\w+\s+\d{4}\b/i,
  /\bat \d{1,2}:\d{2}\s*(am|pm)\b/i,
  /^(leave a (reply|comment)|comments?|reply|posted (on|by)|categories|tags|search)$/i,
];

function isJunkBlock(title: string, body: string): boolean {
  return JUNK_TITLE.some((r) => r.test(title)) || body.replace(/\s/g, "").length < 12;
}

export function analyzeText(
  db: Database,
  raw: string,
  source: Source,
  options?: { asHowTo?: boolean },
): ImportDraft {
  const candidates: ImportCandidate[] = [];

  // The whole document was declared to be a How To guide: one candidate, steps
  // in order, nothing guessed.
  if (options?.asHowTo) {
    const steps = raw
      .split("\n")
      .map((l) => l.replace(/^#{1,6}\s+/, "").trim())
      .filter((l) => l && !isNoise(l));
    const firstLine = steps[0] ?? "How to pray";
    const looksLikeTitle = firstLine.length <= 80;
    candidates.push({
      id: newId("cand"),
      classification: "how_to",
      title: looksLikeTitle ? titleCase(firstLine) : source.name,
      body: (looksLikeTitle ? steps.slice(1) : steps).join("\n"),
      confidence: 1,
      decision: "save_new",
    });
    return {
      id: newId("draft"),
      source,
      raw_text: raw,
      candidates,
      created_at: new Date().toISOString(),
    };
  }

  for (const block of splitBlocks(raw)) {
    if (isJunkBlock(block.title, block.body)) continue;

    // Explicit instruction blocks become How To guides. Everything else keeps
    // its rubric lines (V/. R/. versicles, "Our Father (3x)") with the wording —
    // we no longer invent a guide for every rubric we see.
    if (isExplicitHowTo(block.title, block.body)) {
      candidates.push({
        id: newId("cand"),
        classification: "how_to",
        title: block.title,
        body: block.body,
        confidence: 0.9,
        decision: "save_new",
      });
      continue;
    }

    const body = block.body;
    const { classification, confidence } = classify(block.title, body);

    // Duplicate detection against the existing library.
    let bestId: string | undefined;
    let best = 0;
    for (const prayer of db.prayers) {
      const version = db.prayer_versions.find((v) => v.id === prayer.default_version_id);
      const score = Math.max(
        similarity(body, version?.body ?? ""),
        similarity(block.title, prayer.title) * 0.9,
      );
      if (score > best) {
        best = score;
        bestId = prayer.id;
      }
    }
    const isDuplicate = best >= 0.45 && classification === "prayer";

    const taxonomy = proposeTaxonomy(block.title, body, classification);
    const candidate: ImportCandidate = {
      id: newId("cand"),
      classification: classification === "how_to" ? "source_material" : classification,
      ...taxonomy,
      title: block.title,
      body,
      confidence,
      decision: isDuplicate
        ? "use_existing"
        : classification === "source_material" || classification === "how_to"
          ? "skip"
          : "save_new",
    };
    if (isDuplicate && bestId) {
      candidate.duplicate_of_prayer_id = bestId;
      candidate.similarity = Math.round(best * 100) / 100;
    }
    candidates.push(candidate);
  }



  return {
    id: newId("draft"),
    source,
    raw_text: raw,
    candidates,
    created_at: new Date().toISOString(),
  };
}

/**
 * A prayer the user typed themselves: one candidate, no block splitting, no
 * duplicate guessing beyond a straight library comparison.
 */
export function draftFromWrittenPrayer(
  db: Database,
  title: string,
  body: string,
  source: Source,
  taxonomy?: { prayer_type: PrayerType; expression_type: ExpressionType },
): ImportDraft {
  let bestId: string | undefined;
  let best = 0;
  for (const prayer of db.prayers) {
    const version = db.prayer_versions.find((v) => v.id === prayer.default_version_id);
    const score = Math.max(similarity(body, version?.body ?? ""), similarity(title, prayer.title) * 0.9);
    if (score > best) {
      best = score;
      bestId = prayer.id;
    }
  }
  const duplicate = best >= 0.45;
  const candidate: ImportCandidate = {
    id: newId("cand"),
    classification: "prayer",
    title,
    body,
    confidence: 1,
    decision: duplicate ? "save_alternate_version" : "save_new",
    ...(taxonomy ?? proposeTaxonomy(title, body, "prayer")),
  };
  if (duplicate && bestId) {
    candidate.duplicate_of_prayer_id = bestId;
    candidate.similarity = Math.round(best * 100) / 100;
  }
  return {
    id: newId("draft"),
    source,
    raw_text: body,
    candidates: [candidate],
    created_at: new Date().toISOString(),
  };
}

/**
 * Repetition shorthand printed in booklets: "Hail Mary x10", "(3 times)",
 * "Glory Be — 3x". Devotion bundles keep the count compact; sessions expand it.
 */
export function detectRepetitionCount(title: string, body = ""): number {
  const blob = `${title} ${body.slice(0, 120)}`;
  const patterns = [
    /\bx\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\s*x\b/i,
    /\b(\d{1,2})\s*times\b/i,
    /\((\d{1,2})\)/,
  ];
  const words: Record<string, number> = {
    two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12,
  };
  for (const re of patterns) {
    const n = Number(blob.match(re)?.[1]);
    if (n >= 2 && n <= 60) return n;
  }
  const word = blob.match(/\b(two|three|four|five|six|seven|eight|nine|ten|twelve)\s+times\b/i);
  const mapped = word?.[1] ? words[word[1].toLowerCase()] : undefined;
  return mapped ?? 1;
}

/** Strips the repetition shorthand out of a title before it becomes a prayer. */
export function stripRepetition(title: string): string {
  return title
    .replace(/[\u2014\u2013-]?\s*\b(x\s*\d{1,2}|\d{1,2}\s*x|\d{1,2}\s*times)\b/i, "")
    .replace(/\(\s*\d{1,2}\s*\)/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ---------------- source attribution ---------------- */

const URL_RE = /\bhttps?:\/\/[^\s<>()"']+|(?:^|\s)(www\.[^\s<>()"']+)/i;

/** Finds a printed URL inside imported text, if the document carries one. */
export function detectSourceUrl(raw: string): string | undefined {
  const match = raw.match(URL_RE);
  if (!match) return undefined;
  const found = (match[0] ?? "").trim().replace(/[.,;)]+$/, "");
  if (!found) return undefined;
  return found.startsWith("http") ? found : `https://${found}`;
}

const PUBLISHER_RE = [
  /(?:published|printed|imprimatur|produced|distributed)\s+(?:by|for)\s+([^\n.]{3,60})/i,
  /©\s*(?:\d{4}\s*)?([^\n.]{3,60})/,
  /\bcopyright\s*(?:\d{4})?\s*(?:by)?\s*([^\n.]{3,60})/i,
];

/**
 * Publisher / printer named in the document. Returns undefined when the text
 * carries no attribution — callers fall back to "self".
 */
export function detectPublisher(raw: string): string | undefined {
  for (const re of PUBLISHER_RE) {
    const m = raw.match(re);
    const value = m?.[1]?.trim().replace(/\s+/g, " ");
    if (value) return value;
  }
  return undefined;
}

/** Resolves the source attribution: explicit URL > printed URL > publisher > "self". */
export function resolveAttribution(raw: string, providedUrl?: string): {
  url?: string | undefined;
  attribution: string;
} {
  const url = providedUrl?.trim() || detectSourceUrl(raw);
  const publisher = detectPublisher(raw);
  return { url: url || undefined, attribution: url || publisher || "self" };
}
