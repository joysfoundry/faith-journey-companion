import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { primaryNavLinks } from "./nav-links";

const itemClass =
  "flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[0.7rem] tracking-wide text-muted-foreground transition-colors";

/** Mobile primary nav — a fixed bottom tab bar. Hidden at md+ (see SideNav). */
export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-parchment/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch">
        {primaryNavLinks.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className={itemClass}
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" strokeWidth={1.6} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
        <li className="flex-1">
          <button type="button" onClick={onMenuClick} className={itemClass}>
            <Menu className="size-5" strokeWidth={1.6} aria-hidden />
            Menu
          </button>
        </li>
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
