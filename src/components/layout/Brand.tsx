import { Link } from "@tanstack/react-router";

/** The four movements of prayer that ACTS stands for. */
const ACTS_WORDS = ["Adoration", "Contrition", "Thanksgiving", "Supplication"] as const;

/**
 * App wordmark — "ACTS" (Adoration, Contrition, Thanksgiving, Supplication).
 * With `tagline`, the acronym is spelled out beneath: each word's initial stays
 * upright and tinted (echoing the four letters), the rest flows in a script face.
 * Links home; pass `onClick` to also close a drawer.
 */
export function Brand({ onClick, tagline = false }: { onClick?: () => void; tagline?: boolean }) {
  return (
    <Link to="/" onClick={onClick} className="block text-foreground" aria-label="ACTS — home">
      <span className="font-display text-xl tracking-wide">ACTS</span>
      {tagline ? (
        <span className="mt-0.5 block text-sm leading-tight text-muted-foreground">
          {ACTS_WORDS.map((word, i) => (
            <span key={word}>
              <span className="font-display font-medium text-primary">{word[0]}</span>
              <span className="font-script">{word.slice(1)}</span>
              {i < ACTS_WORDS.length - 1 ? <span className="font-display"> · </span> : ""}
            </span>
          ))}
        </span>
      ) : null}
    </Link>
  );
}
