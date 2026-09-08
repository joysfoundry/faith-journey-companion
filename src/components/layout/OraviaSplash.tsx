import { REGULAR_CROSS } from "./OraviaMark";

/**
 * The app-load splash (ACTS-175).
 *
 * A full-screen holding state shown while the local database loads. It draws the
 * Oravia mark large, with the **compass bezel circling** a fixed cross — the ring
 * sweeps, the cross stays still, so the mark reads the way it does everywhere else
 * (a compass first, a cross a moment later) while it turns.
 *
 * The rotation is pure CSS (`.oravia-splash-spin` in `styles.css`), so it animates
 * on the SSR'd paint before hydration and stops entirely under
 * `prefers-reduced-motion`. Colour comes from theme tokens, so it's correct in
 * light and dark without a second copy.
 *
 * Pass `fading` to cross-fade it out once the app is ready; the parent unmounts it
 * after the transition.
 */
const RING_RADIUS = 33;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 207.3
// A ~30% arc that sweeps the bezel like a compass needle; the rest is the gap.
const SWEEP = RING_CIRCUMFERENCE * 0.3;
const SWEEP_DASH = `${SWEEP} ${RING_CIRCUMFERENCE - SWEEP}`;

export function OraviaSplash({
  fading = false,
  size = 76,
}: {
  fading?: boolean;
  size?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading Oravia"
      aria-hidden={fading ? true : undefined}
      className={[
        "fixed inset-0 z-[60] flex items-center justify-center bg-background",
        "transition-opacity duration-500 ease-out",
        fading ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Base: a faint full ring + the fixed cross. Does not rotate. */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          className="absolute inset-0"
        >
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            stroke="currentColor"
            strokeWidth="6"
            className="text-border"
          />
          <path d={REGULAR_CROSS} fill="currentColor" className="text-foreground" />
        </svg>

        {/* The circling bezel: a gold arc that sweeps the ring. Rotates as a whole
            element around its own centre — reliable everywhere, unlike rotating a
            path in place. */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          className="oravia-splash-spin absolute inset-0"
        >
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={SWEEP_DASH}
            className="text-gold"
          />
        </svg>
      </div>
      <span className="sr-only">Loading Oravia…</span>
    </div>
  );
}
