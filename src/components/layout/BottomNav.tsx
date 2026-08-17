import { Link } from "@tanstack/react-router";
import { Heart, Home, MoreHorizontal, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Today", icon: Home },
  { to: "/pray", label: "Pray", icon: Sparkles },
  { to: "/prayers", label: "Prayers", icon: Heart },
  { to: "/more", label: "More", icon: MoreHorizontal },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-parchment/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.7rem] tracking-wide text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" strokeWidth={1.6} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
