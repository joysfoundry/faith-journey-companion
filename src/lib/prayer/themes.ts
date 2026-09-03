import type { Reflection } from "./types";

/**
 * No-AI theme suggestions for reflections (ACTS-135). Themes are optional and
 * user-owned; this only *suggests* — it never auto-applies. Two deterministic,
 * offline sources: (1) a curated lexicon of spiritual themes matched against the
 * entry text, and (2) the themes the user has used before (frequency + recency).
 *
 * Themes are normalized lowercase so "Trust" and "trust" group together; the UI
 * capitalizes for display via {@link displayTheme}.
 */

/**
 * Curated seed lexicon: canonical theme → trigger words/stems. Matching is
 * word-prefix based (see {@link matchesText}), so "forgive" also catches
 * "forgiveness"/"forgiving". Editable by hand — this is data, not logic.
 */
export const THEME_LEXICON: Record<string, string[]> = {
  gratitude: ["grateful", "gratitude", "thankful", "thanks", "blessed", "blessing", "appreciate"],
  trust: [
    "trust",
    "surrender",
    "rely",
    "reliance",
    "providence",
    "provide",
    "provision",
    "let go",
    "lean on",
    "depend",
  ],
  forgiveness: ["forgiv", "forgave", "mercy", "merciful", "pardon", "reconcile", "forgotten"],
  hope: ["hope", "hopeful", "longing", "await", "awaiting", "expectant", "look forward"],
  fear: ["fear", "afraid", "anxious", "anxiety", "worry", "worried", "dread", "scared", "nervous"],
  peace: ["peace", "peaceful", "calm", "stillness", "serenity", "rest", "settled", "at ease"],
  suffering: [
    "suffer",
    "suffering",
    "pain",
    "painful",
    "cross",
    "trial",
    "hardship",
    "struggle",
    "hurt",
    "ache",
  ],
  love: ["love", "loving", "beloved", "charity", "compassion", "tender", "affection", "cherish"],
  faith: ["faith", "faithful", "believe", "belief", "trusting god", "conviction"],
  doubt: ["doubt", "uncertain", "unsure", "confused", "confusion", "questioning", "lost", "wrestl"],
  joy: ["joy", "joyful", "rejoice", "delight", "glad", "gladness", "happy", "happiness"],
  humility: ["humble", "humility", "lowly", "pride", "prideful", "ego", "meek"],
  patience: ["patience", "patient", "waiting", "endure", "endurance", "slow down"],
  discernment: [
    "discern",
    "discernment",
    "decision",
    "decide",
    "guidance",
    "calling",
    "vocation",
    "purpose",
    "direction",
  ],
  repentance: [
    "repent",
    "repentance",
    "sin",
    "confession",
    "contrition",
    "sorrow for",
    "turn away",
  ],
  prayer: ["pray", "prayer", "intercession", "praying", "petition"],
  family: [
    "family",
    "children",
    "spouse",
    "marriage",
    "parents",
    "mother",
    "father",
    "son",
    "daughter",
    "husband",
    "wife",
    "kids",
  ],
  friendship: ["friend", "friendship", "community", "companion", "fellowship", "neighbor"],
  healing: ["heal", "healing", "wounded", "broken", "restore", "restored", "mend", "whole"],
  perseverance: [
    "persevere",
    "perseverance",
    "persist",
    "steadfast",
    "keep going",
    "endure",
    "resolve",
  ],
  grief: ["grief", "grieving", "loss", "mourning", "mourn", "death", "died", "bereaved"],
  loneliness: ["lonely", "loneliness", "alone", "isolated", "isolation", "abandoned"],
  anger: ["anger", "angry", "frustration", "frustrated", "resentment", "bitter", "irritated"],
  guilt: ["guilt", "guilty", "shame", "ashamed", "unworthy", "regret"],
  grace: ["grace", "gift", "undeserved", "unmerited", "favor"],
  wonder: ["wonder", "awe", "beauty", "glory", "majesty", "marvel", "creation"],
  worship: ["worship", "praise", "adoration", "adore", "reverence", "glorify"],
  scripture: ["scripture", "verse", "gospel", "psalm", "reading", "word of god", "passage"],
  presence: ["presence", "near", "close to god", "with me", "encounter", "felt god"],
  conversion: [
    "conversion",
    "convert",
    "renewal",
    "transform",
    "grow",
    "growth",
    "change of heart",
  ],
  temptation: ["temptation", "tempted", "weakness", "resist"],
  courage: ["courage", "courageous", "brave", "bold", "strength", "strong", "fortitude"],
  service: ["serve", "service", "give", "generosity", "generous", "sacrifice", "self-giving"],
  silence: ["silence", "silent", "solitude", "quiet", "stillness", "listen"],
};

/** Lowercase, collapse whitespace — the canonical stored form of a theme. */
export function normalizeTheme(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Capitalize the first letter for display; storage stays lowercase. */
export function displayTheme(theme: string): string {
  const t = theme.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** True if any of `needles` appears in `haystack` as a word-prefix (case-insensitive). */
function matchesText(haystack: string, needles: string[]): boolean {
  return needles.some((n) => {
    const term = n.toLowerCase().trim();
    if (!term) return false;
    // Word-boundary on the left; prefix match on the right so stems catch inflections.
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    return re.test(haystack);
  });
}

/** Count how many prior reflections used each theme, and when it was last used. */
export function themeHistory(
  reflections: Reflection[],
): { theme: string; count: number; lastUsed: string }[] {
  const stats = new Map<string, { count: number; lastUsed: string }>();
  for (const r of reflections) {
    for (const raw of r.themes ?? []) {
      const theme = normalizeTheme(raw);
      if (!theme) continue;
      const prev = stats.get(theme);
      if (prev) {
        prev.count += 1;
        if ((r.created_at ?? "") > prev.lastUsed) prev.lastUsed = r.created_at ?? "";
      } else {
        stats.set(theme, { count: 1, lastUsed: r.created_at ?? "" });
      }
    }
  }
  return [...stats.entries()]
    .map(([theme, s]) => ({ theme, ...s }))
    .sort((a, b) => b.count - a.count || b.lastUsed.localeCompare(a.lastUsed));
}

/**
 * Suggest themes for an entry, most-relevant first. Lexicon matches (contextual to
 * what was written) rank above history matches; already-applied themes are excluded.
 * Returns normalized theme strings.
 */
export function suggestThemes(
  text: string,
  opts: { history?: string[]; applied?: string[]; limit?: number } = {},
): string[] {
  const { history = [], applied = [], limit = 5 } = opts;
  const appliedSet = new Set(applied.map(normalizeTheme));
  const hay = (text ?? "").toLowerCase();

  const lexiconMatches = Object.keys(THEME_LEXICON)
    .filter((theme) => matchesText(hay, THEME_LEXICON[theme] ?? []))
    .filter((theme) => !appliedSet.has(theme));

  // Prior tags the writer reused that also surface in this text — personalization.
  const historyMatches = history
    .map(normalizeTheme)
    .filter((theme, i, arr) => theme && arr.indexOf(theme) === i)
    .filter((theme) => !appliedSet.has(theme) && !lexiconMatches.includes(theme))
    .filter((theme) => hay.includes(theme));

  return [...lexiconMatches, ...historyMatches].slice(0, limit);
}
