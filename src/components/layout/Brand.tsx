import { Link } from "@tanstack/react-router";

import { OraviaMark } from "./OraviaMark";
import { OraviaWordmark, WORDMARK_LOCKUP_ENABLED } from "./OraviaWordmark";

/**
 * App lockup — the mark (ACTS-148) beside the "Oravia" wordmark (from Latin
 * *ora*, "pray" + *via*, "the way"). With `tagline`, the brand line "Your
 * devotional life, gathered." sits beneath in small letter-spaced caps.
 * Links home; pass `onClick` to also close a drawer.
 *
 * The mark is decorative here — the link already carries the accessible name —
 * so it is aria-hidden rather than doubling the label for screen readers.
 *
 * Behind `WORDMARK_LOCKUP_ENABLED` (currently `false`) sits the proposed
 * alternative: the mark set *inside* the word as its O, rather than beside it.
 * Flipping that one flag switches this and the arrival screen together.
 */
export function Brand({ onClick, tagline = false }: { onClick?: () => void; tagline?: boolean }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2.5 text-foreground"
      aria-label="Oravia — home"
    >
      {WORDMARK_LOCKUP_ENABLED ? null : (
        <OraviaMark size={tagline ? 30 : 26} className="shrink-0 text-gold" />
      )}
      <span className="block">
        {WORDMARK_LOCKUP_ENABLED ? (
          <OraviaWordmark fontSize={20} className="block font-display" markClassName="text-gold" />
        ) : (
          <span className="block font-display text-xl leading-none tracking-wide">Oravia</span>
        )}
        {tagline ? (
          <span className="mt-1 block text-[9px] font-medium uppercase leading-tight tracking-[0.14em] text-muted-foreground">
            Your devotional life, gathered.
          </span>
        ) : null}
      </span>
    </Link>
  );
}
