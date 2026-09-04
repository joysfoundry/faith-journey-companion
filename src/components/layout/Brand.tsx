import { Link } from "@tanstack/react-router";

/**
 * App wordmark — "Oravia" (from Latin *ora*, "pray" + *via*, "the way").
 * With `tagline`, the brand line "Your Catholic life, connected." sits beneath
 * in small letter-spaced caps. Links home; pass `onClick` to also close a drawer.
 */
export function Brand({ onClick, tagline = false }: { onClick?: () => void; tagline?: boolean }) {
  return (
    <Link to="/" onClick={onClick} className="block text-foreground" aria-label="Oravia — home">
      <span className="font-display text-xl tracking-wide">Oravia</span>
      {tagline ? (
        <span className="mt-1 block text-[9px] font-medium uppercase leading-tight tracking-[0.14em] text-muted-foreground">
          Your devotional life, gathered.
        </span>
      ) : null}
    </Link>
  );
}
