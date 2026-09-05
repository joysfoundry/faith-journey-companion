/**
 * Bible-app catalog + passage deep-linking.
 *
 * The user picks the Bible app they read in (Settings → Bible). We store that
 * choice plus a preferred translation, then use `buildPassageUrl` wherever the
 * app wants to hand a reader off to "their" Bible — today's readings, a cited
 * verse, a reading program. Nothing is embedded (NIV and most translations are
 * licensed); we deep-link out, always opening in a new tab.
 *
 * Bible Gateway is the reliable engine: its `version` codes are stable and it
 * resolves any human reference string, so it is the universal fallback. Other
 * apps deep-link only where we can build a trustworthy URL, and otherwise fall
 * back to Bible Gateway with the chosen translation.
 */

export type BibleAppId = "youversion" | "biblegateway" | "olivetree" | "other" | "none";

export interface BibleApp {
  id: BibleAppId;
  name: string;
  /** One-line "why you'd pick this". */
  blurb: string;
  /** Home / install link. */
  homeUrl: string;
  /** True when the app offers the NIV — used for the "recommend NIV apps" list. */
  hasNiv: boolean;
  /** Show in the recommendations list when the user has no app set. */
  recommended: boolean;
}

/** Ordered for display. `other` / `none` are real, selectable choices. */
export const BIBLE_APPS: BibleApp[] = [
  {
    id: "youversion",
    name: "YouVersion (Bible App)",
    blurb: "The most popular free Bible app — includes the NIV.",
    homeUrl: "https://www.bible.com",
    hasNiv: true,
    recommended: true,
  },
  {
    id: "biblegateway",
    name: "Bible Gateway",
    blurb: "Read any passage in dozens of translations, including the NIV.",
    homeUrl: "https://www.biblegateway.com",
    hasNiv: true,
    recommended: true,
  },
  {
    id: "olivetree",
    name: "Olive Tree Bible",
    blurb: "Study-focused reader with the NIV and offline reading.",
    homeUrl: "https://www.olivetree.com",
    hasNiv: true,
    recommended: true,
  },
  {
    id: "other",
    name: "Another app",
    blurb: "I read in a different app.",
    homeUrl: "https://www.biblegateway.com",
    hasNiv: false,
    recommended: false,
  },
  {
    id: "none",
    name: "I don't use one yet",
    blurb: "See a couple of good, free options below.",
    homeUrl: "https://www.biblegateway.com",
    hasNiv: false,
    recommended: false,
  },
];

export function bibleAppById(id: string | undefined): BibleApp | undefined {
  return BIBLE_APPS.find((a) => a.id === id);
}

/** The app assumed when the reader hasn't chosen one yet. */
export const DEFAULT_BIBLE_APP = "youversion";

/** The effective app id — the reader's choice, or the YouVersion default. */
export function effectiveBibleAppId(id: string | undefined): string {
  return id ?? DEFAULT_BIBLE_APP;
}

export const RECOMMENDED_BIBLE_APPS = BIBLE_APPS.filter((a) => a.recommended);

/**
 * Translations offered in Settings. `gateway` is Bible Gateway's version code
 * (always works). `youversion` is Bible.com's numeric version id — set only
 * where confident, so YouVersion deep-links never load the wrong translation.
 */
export interface BibleTranslation {
  /** Stored id + display abbreviation. */
  id: string;
  label: string;
  /** Bible Gateway `version` query code. */
  gateway: string;
  /** Bible.com version id, when known. */
  youversion?: number;
  /** Roman Catholic canon (deuterocanon included) — handy in this app's context. */
  catholic?: boolean;
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: "NIV", label: "NIV — New International Version", gateway: "NIV", youversion: 111 },
  { id: "ESV", label: "ESV — English Standard Version", gateway: "ESV", youversion: 59 },
  { id: "NLT", label: "NLT — New Living Translation", gateway: "NLT", youversion: 116 },
  { id: "NKJV", label: "NKJV — New King James Version", gateway: "NKJV" },
  { id: "KJV", label: "KJV — King James Version", gateway: "KJV", youversion: 1 },
  { id: "NASB", label: "NASB — New American Standard", gateway: "NASB1995" },
  {
    id: "NABRE",
    label: "NABRE — New American Bible (Rev.)",
    gateway: "NABRE",
    catholic: true,
  },
  {
    id: "RSVCE",
    label: "RSV-CE — Revised Standard, Catholic Ed.",
    gateway: "RSVCE",
    catholic: true,
  },
  {
    id: "DRA",
    label: "DRA — Douay-Rheims (public domain)",
    gateway: "DRA",
    catholic: true,
  },
];

/**
 * The translation assumed until the reader picks one. **NABRE** (JC, 2026-09-04,
 * ACTS-153): it is the Catholic canon — deuterocanon included — and it is the
 * translation behind the USCCB daily readings this app already links to, so the
 * default matches the Word page. NIV and the rest stay one tap away in Settings.
 */
export const DEFAULT_TRANSLATION = "NABRE";

export function translationById(id: string | undefined): BibleTranslation {
  return (
    BIBLE_TRANSLATIONS.find((t) => t.id === id) ??
    BIBLE_TRANSLATIONS.find((t) => t.id === DEFAULT_TRANSLATION)!
  );
}

/**
 * USFM book codes — only YouVersion needs these (Bible Gateway takes the raw
 * reference string). Missing books simply fall back to Bible Gateway.
 */
const USFM: Record<string, string> = {
  genesis: "GEN",
  exodus: "EXO",
  leviticus: "LEV",
  numbers: "NUM",
  deuteronomy: "DEU",
  joshua: "JOS",
  judges: "JDG",
  ruth: "RUT",
  "1 samuel": "1SA",
  "2 samuel": "2SA",
  "1 kings": "1KI",
  "2 kings": "2KI",
  "1 chronicles": "1CH",
  "2 chronicles": "2CH",
  ezra: "EZR",
  nehemiah: "NEH",
  esther: "EST",
  job: "JOB",
  psalm: "PSA",
  psalms: "PSA",
  proverbs: "PRO",
  ecclesiastes: "ECC",
  "song of solomon": "SNG",
  "song of songs": "SNG",
  isaiah: "ISA",
  jeremiah: "JER",
  lamentations: "LAM",
  ezekiel: "EZK",
  daniel: "DAN",
  hosea: "HOS",
  joel: "JOL",
  amos: "AMO",
  obadiah: "OBA",
  jonah: "JON",
  micah: "MIC",
  nahum: "NAM",
  habakkuk: "HAB",
  zephaniah: "ZEP",
  haggai: "HAG",
  zechariah: "ZEC",
  malachi: "MAL",
  matthew: "MAT",
  mark: "MRK",
  luke: "LUK",
  john: "JHN",
  acts: "ACT",
  romans: "ROM",
  "1 corinthians": "1CO",
  "2 corinthians": "2CO",
  galatians: "GAL",
  ephesians: "EPH",
  philippians: "PHP",
  colossians: "COL",
  "1 thessalonians": "1TH",
  "2 thessalonians": "2TH",
  "1 timothy": "1TI",
  "2 timothy": "2TI",
  titus: "TIT",
  philemon: "PHM",
  hebrews: "HEB",
  james: "JAS",
  "1 peter": "1PE",
  "2 peter": "2PE",
  "1 john": "1JN",
  "2 john": "2JN",
  "3 john": "3JN",
  jude: "JUD",
  revelation: "REV",
  // Deuterocanon (Catholic canon)
  tobit: "TOB",
  judith: "JDT",
  wisdom: "WIS",
  sirach: "SIR",
  ecclesiasticus: "SIR",
  baruch: "BAR",
  "1 maccabees": "1MA",
  "2 maccabees": "2MA",
};

interface ParsedRef {
  usfm: string;
  chapter: number;
  verse?: number;
}

/**
 * Parse a human reference ("John 3:16", "1 Corinthians 13:4-7", "Psalm 23")
 * into the pieces YouVersion needs. Returns null when we can't be confident.
 */
export function parseReference(ref: string): ParsedRef | null {
  const trimmed = ref.trim().replace(/\s+/g, " ");
  // Leading book, which may start with a 1/2/3 numeral: "1 John", "Song of Songs".
  const match = trimmed.match(/^((?:[123]\s)?[A-Za-z][A-Za-z ]*?)\s+(\d+)(?::(\d+))?/);
  if (!match || !match[1] || !match[2]) return null;
  const book = match[1].toLowerCase().replace(/\.$/, "").trim();
  const usfm = USFM[book];
  if (!usfm) return null;
  const chapter = Number(match[2]);
  if (!Number.isFinite(chapter)) return null;
  const verse = match[3] ? Number(match[3]) : undefined;
  return verse !== undefined ? { usfm, chapter, verse } : { usfm, chapter };
}

function gatewayUrl(ref: string, translation: BibleTranslation): string {
  const params = new URLSearchParams({ search: ref, version: translation.gateway });
  return `https://www.biblegateway.com/passage/?${params.toString()}`;
}

/**
 * Build a deep link to `ref` for a specific app + translation, or null when the
 * app can't take a passage link. Callers should use `buildPassageUrl` instead,
 * which never returns null.
 */
export function passageUrlFor(
  appId: string | undefined,
  ref: string,
  translation: BibleTranslation,
): string | null {
  if (appId === "biblegateway") return gatewayUrl(ref, translation);
  if (appId === "youversion") {
    const parsed = parseReference(ref);
    if (!parsed || !translation.youversion) return null;
    const tail = parsed.verse ? `.${parsed.verse}` : "";
    return `https://www.bible.com/bible/${translation.youversion}/${parsed.usfm}.${parsed.chapter}${tail}.${translation.id}`;
  }
  return null;
}

export interface BibleSettings {
  bible_app_id?: string | undefined;
  bible_translation?: string | undefined;
  bible_app_custom_url?: string | undefined;
}

/** Add a scheme if the user typed a bare domain; return "" for empty/blank. */
export function normalizeUrl(input: string | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

/**
 * Where "open my Bible" should point: the custom URL for "Another app", else
 * the catalog home URL for the chosen app. Empty string when nothing is set.
 */
export function resolveBibleHomeUrl(settings: BibleSettings): string {
  const id = effectiveBibleAppId(settings.bible_app_id);
  if (id === "other") return normalizeUrl(settings.bible_app_custom_url);
  if (id === "none") return "";
  return bibleAppById(id)?.homeUrl ?? "";
}

/**
 * The one call reading UIs should use: given the user's settings and a passage
 * reference, return a link that opens in their chosen Bible — falling back to
 * Bible Gateway (which always resolves) when their app can't take a deep link.
 */
export function buildPassageUrl(settings: BibleSettings, ref: string): string {
  const translation = translationById(settings.bible_translation);
  const appId = effectiveBibleAppId(settings.bible_app_id);
  return passageUrlFor(appId, ref, translation) ?? gatewayUrl(ref, translation);
}
