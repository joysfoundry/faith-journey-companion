/**
 * Deterministic import analysis: UPLOAD -> ANALYZE -> PROPOSE -> REVIEW -> SAVE.
 *
 * This module only *proposes* classifications. Nothing is saved until the user
 * confirms on the Import Review screen. AI can later replace `analyzeText`
 * without changing any consumer.
 */
import type {
  Database,
  ImportCandidate,
  ImportClassification,
  ImportDraft,
  Source,
} from "./types";
import { newId } from "./compiler";

const INSTRUCTION_HINTS = [
  /\bsay\b.*\b(one|two|three|ten|\d+)\b/i,
  /\brepeat\b/i,
  /\bbegin\b.*\bwith\b/i,
  /\bafter each decade\b/i,
  /\bhow to\b/i,
  /\bthen (pray|say)\b/i,
];

const NOVENA_HINTS = [/\bnovena\b/i, /\bday\s*\d+\b/i, /\b54[- ]day\b/i];
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

  if (NOVENA_HINTS.some((r) => r.test(blob)) && /\bday\b/i.test(blob))
    return { classification: "novena", confidence: 0.7 };
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

/** Splits raw text into titled blocks using heading-ish lines (markdown aware). */
export function splitBlocks(raw: string): Array<{ title: string; body: string }> {
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\*\*/g, "").replace(/^\*|\*$/g, "").trimEnd())
    .filter((l) => !/^\s*(-{3,}|={3,}|`{3,})\s*$/.test(l));

  const blocks: Array<{ title: string; body: string[] }> = [];
  const isHeading = (line: string) => {
    const t = line.trim();
    if (!t) return false;
    if (/^#{1,6}\s+/.test(t)) return true;
    if (t.length > 60) return false;
    if (/^\d+$/.test(t)) return false;
    if (/^[->*|]/.test(t)) return false;
    const letters = t.replace(/[^A-Za-z]/g, "");
    if (!letters) return false;
    const upperRatio = letters.split("").filter((c) => c === c.toUpperCase()).length / letters.length;
    return upperRatio > 0.85;
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
    .map((b) => ({ title: titleCase(b.title), body: b.body.join(" ").replace(/\s+/g, " ").trim() }))
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

export function analyzeText(db: Database, raw: string, source: Source): ImportDraft {
  const candidates: ImportCandidate[] = splitBlocks(raw).map((block) => {
    const { classification, confidence } = classify(block.title, block.body);

    // Duplicate detection against the existing library.
    let bestId: string | undefined;
    let best = 0;
    for (const prayer of db.prayers) {
      const version = db.prayer_versions.find((v) => v.id === prayer.default_version_id);
      const score = Math.max(
        similarity(block.body, version?.body ?? ""),
        similarity(block.title, prayer.title) * 0.9,
      );
      if (score > best) {
        best = score;
        bestId = prayer.id;
      }
    }
    const isDuplicate = best >= 0.45 && classification === "prayer";

    const candidate: ImportCandidate = {
      id: newId("cand"),
      classification,
      title: block.title,
      body: block.body,
      confidence,
      decision: isDuplicate
        ? "use_existing"
        : classification === "source_material"
          ? "skip"
          : "save_new",

    };
    if (isDuplicate && bestId) {
      candidate.duplicate_of_prayer_id = bestId;
      candidate.similarity = Math.round(best * 100) / 100;
    }
    return candidate;
  });

  return {
    id: newId("draft"),
    source,
    raw_text: raw,
    candidates,
    created_at: new Date().toISOString(),
  };
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
