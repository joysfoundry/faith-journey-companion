import { Link } from "@tanstack/react-router";

import { primaryNavLinks, secondaryNavLinks } from "./nav-links";

const itemClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5";
const activeItemClass = "bg-primary/10 text-primary";

/**
 * The menu body — primary items, a divider, then secondary items. Shared by the
 * desktop side rail (SideNav) and the mobile drawer (MobileNavDrawer).
 * `onNavigate` lets the drawer close itself when a link is tapped.
 */
export function NavSections({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <ul className="space-y-1">
        {primaryNavLinks.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              onClick={onNavigate}
              className={itemClass}
              activeProps={{ className: activeItemClass }}
            >
              <Icon className="size-5" strokeWidth={1.6} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="my-4 border-t border-border/60" />

      <ul className="space-y-1">
        {secondaryNavLinks.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onNavigate}
              className={itemClass}
              activeProps={{ className: activeItemClass }}
            >
              <Icon className="size-5" strokeWidth={1.6} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
