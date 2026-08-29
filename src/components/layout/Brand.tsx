import { Link } from "@tanstack/react-router";

/** The four movements of prayer that ACTS stands for. */
const ACTS_WORDS = ["Adoration", "Contrition", "Thanksgiving", "Supplication"] as const;

/**
 * App wordmark — "ACTS" (Adoration, Contrition, Thanksgiving, Supplication).
 * With `tagline`, the acronym is spelled out beneath in small letter-spaced caps,
 * each word's initial set larger to echo the four letters. Links home; pass
 * `onClick` to also close a drawer.
 */
export function Brand({ onClick, tagline = false }: { onClick?: () => void; tagline?: boolean }) {
  return (
    <Link to="/" onClick={onClick} className="block text-foreground" aria-label="ACTS — home">
      <span className="font-display text-xl tracking-wide">ACTS</span>
      {tagline ? (
        <span className="mt-1 block text-[9px] font-medium uppercase leading-tight tracking-[0.14em] text-muted-foreground">
          {ACTS_WORDS.map((word, i) => (
            <span key={word}>
              <span className="text-[12px] font-semibold">{word[0]}</span>
              {word.slice(1)}
              {i < ACTS_WORDS.length - 1 ? " · " : ""}
            </span>
          ))}
        </span>
      ) : null}
    </Link>
  );
}
