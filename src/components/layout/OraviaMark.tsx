/**
 * The Oravia mark (ACTS-148).
 *
 * A ring that reads three ways at once: the **O** of Oravia, a **compass**
 * bezel, and — because the vertical axis runs long (60 units against 42) and
 * the crossbar sits above centre — a **cross**. The compass is what you see;
 * the cross is what you notice a moment later.
 *
 * Those proportions are load-bearing. Equalise the arms or drop the crossbar to
 * centre and it stops reading as a cross and starts reading as a crosshair.
 *
 * Two cuts, per `docs/brand/design-system/brand/mark.html`:
 *   · regular — 24px and up
 *   · small   — 16–20px, where the regular ring thins to a hairline
 *
 * Colour comes from `currentColor`, so set it on the element or a parent.
 */
export function OraviaMark({
  size = 28,
  small = false,
  className,
  title,
}: {
  size?: number;
  /** Use the heavier cut. Correct below 24px; wrong above it. */
  small?: boolean;
  className?: string;
  /** Only pass this when the mark stands alone; beside a wordmark it is decorative. */
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {small ? (
        <>
          <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="8" fill="none" />
          <path d="M50 22 L55 38 L68 42 L55 46.4 L50 78 L45 46.4 L32 42 L45 38 Z" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="6" fill="none" />
          <path
            d="M50 20 L54.2 38.4 L71 42 L54.2 45.6 L50 80 L45.8 45.6 L29 42 L45.8 38.4 Z"
            fill="currentColor"
          />
        </>
      )}
    </svg>
  );
}
