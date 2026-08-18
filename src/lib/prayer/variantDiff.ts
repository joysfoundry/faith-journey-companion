/**
 * Tells apart two or more wordings of the same prayer.
 *
 * Devotions bundle one specific version, so the builder has to show *what is
 * different* about each wording rather than an opaque label.
 */

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Splits a prayer body into phrases small enough to read in a list row. */
function phrases(body: string): string[] {
  return body
    .split(/\n+|(?<=[.;:!?])\s+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 2);
}

/**
 * The first phrase of `body` that none of the other wordings contain — the
 * clearest single line for telling this version apart. Falls back to the
 * opening words when the wordings differ only in punctuation or length.
 */
export function distinctivePhrase(body: string, others: string[], maxLength = 110): string {
  const otherNormalized = others.map(normalize);
  for (const phrase of phrases(body)) {
    const needle = normalize(phrase);
    if (!needle) continue;
    if (!otherNormalized.some((o) => o.includes(needle))) return truncate(phrase, maxLength);
  }
  return truncate(phrases(body)[0] ?? body, maxLength);
}

/** Word count difference, used as a secondary hint ("12 words longer"). */
export function lengthHint(body: string, reference: string): string | null {
  const count = (t: string) => normalize(t).split(" ").filter(Boolean).length;
  const delta = count(body) - count(reference);
  if (delta === 0) return null;
  return `${Math.abs(delta)} word${Math.abs(delta) === 1 ? "" : "s"} ${delta > 0 ? "longer" : "shorter"}`;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}
