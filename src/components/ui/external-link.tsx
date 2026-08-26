import type { AnchorHTMLAttributes, MouseEvent } from "react";

/**
 * An anchor that always opens in a new tab.
 *
 * `target="_blank"` alone is unreliable — some in-app/embedded webviews strip it
 * and navigate the current tab, replacing the app. So on a plain left-click we
 * also fire a guarded `window.open` and cancel the default navigation, while
 * leaving modified clicks (⌘/Ctrl/middle) and non-http hrefs to the browser.
 *
 * Use this for every link that leaves the app.
 */
export function ExternalLink({
  href,
  onClick,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let the browser handle modified / non-left clicks (open-in-new-tab, etc.).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!href) return;
    const win = window.open(href, "_blank");
    if (win) {
      // Sever the opener for security (rel="noopener" covers the default path).
      win.opener = null;
      e.preventDefault();
    }
    // If the popup was blocked (win === null), fall through to the anchor's
    // own target="_blank" — no worse than before.
  }

  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
      {children}
    </a>
  );
}
