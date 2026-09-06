import { REGULAR_CROSS, SMALL_CROSS } from "./OraviaMark";

/**
 * The mark set *inside* the word — the ring becomes the O of Oravia.
 *
 * LIVE. Both call sites (`Brand.tsx`, `gate-shell.tsx`) branch on the flag
 * below; set `false` and every surface reverts to the mark *beside* the word in
 * one edit. Specimens, fit ladder and do/don't rules live in
 * `docs/brand/design-system/brand/wordmark.html`.
 *
 * ⚠️ **This shrinks the mark in the header.** `Brand.tsx` used to set a 30px
 * `OraviaMark` next to 20px text — a ring 21.6px across, 1.5× the type. As the O
 * it is bound to the type instead, so at the same 20px it measures **13.3px:
 * 62% of what it was**. That is inherent to the idea, not a bug — but if the
 * header needs its old presence back, raise the wordmark's `fontSize` there
 * rather than breaking the fit ratio, which is what keeps the ring reading as a
 * letter instead of an ornament parked next to one.
 *
 * Two numbers are load-bearing and were measured, not guessed:
 *
 * `O_INK` — a Cormorant Garamond capital O inks **0.648** of its font-size,
 * rasterised and bounding-boxed at 128px and 256px (identical at weights 400,
 * 500 and 600 — only the stroke thickens). Below ~40px the measurement is
 * rasterisation noise, which is exactly why this is a constant and not a
 * runtime canvas probe.
 *
 * `OUTER` — an SVG centres a stroke on its path, so the mark's visible outer
 * diameter is `2 × (r + stroke/2)` = **72** of its 100-unit canvas, *not* `2r`
 * = 66. Sizing off 2r is the off-by-a-stroke that shipped the app icons at 40%
 * of their tile (ACTS-167); it renders the ring ~9% small here.
 */
export const WORDMARK_LOCKUP_ENABLED = true;

/** Ink height of a Cormorant "O" as a fraction of font-size. Measured. */
const O_INK = 0.648;
/** How far that O drops below the baseline, as a fraction of font-size. */
const O_OVERSHOOT = 0.008;
/** The mark's visible outer diameter, in units of its 100-unit canvas. */
const OUTER = 72;
/**
 * Ring diameter ÷ the O it replaces. 1.00 is a true match; a thin monoline ring
 * carries less weight than a modulated serif O of the same size, so the eye
 * wants a little more. See the fit ladder in the design-system card.
 */
const FIT = 1.03;
/** Below this the regular ring thins to a hairline behind the letterforms. */
const SMALL_CUT_BELOW = 28;

export function OraviaWordmark({
  fontSize,
  className,
  markClassName,
  title,
}: {
  /** In px — the geometry is computed from it, so it cannot be a CSS class. */
  fontSize: number;
  className?: string;
  /** Colour the ring apart from the word, e.g. `text-gold`. */
  markClassName?: string;
  /** Only when the lockup stands alone; inside an already-labelled link, omit. */
  title?: string;
}) {
  const small = fontSize < SMALL_CUT_BELOW;
  const r = small ? 32 : 33;
  const strokeWidth = small ? 8 : 6;

  const diameter = fontSize * O_INK * FIT;
  const box = (diameter * 100) / OUTER;
  // An inline-block sits its bottom on the baseline; the ring's bottom is
  // (box - diameter) / 2 above that, so push it down by the gap plus the
  // overshoot the round letters already have.
  const drop = (box - diameter) / 2 + fontSize * O_OVERSHOOT;

  return (
    <span
      className={className}
      style={{ fontSize, lineHeight: 1, whiteSpace: "nowrap" }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <span
        className={markClassName}
        style={{
          display: "inline-block",
          verticalAlign: "baseline",
          position: "relative",
          top: drop,
        }}
      >
        <svg width={box} height={box} viewBox="0 0 100 100" fill="none" style={{ display: "block" }}>
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <path d={small ? SMALL_CROSS : REGULAR_CROSS} fill="currentColor" />
        </svg>
      </span>
      ravia
    </span>
  );
}
