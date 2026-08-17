import { Link } from "@tanstack/react-router";
import { BookOpen, Heart, Home, NotebookPen, Sun } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { key: "home", label: "Today", icon: Home, to: "/" as const },
  { key: "devotion", label: "Devotion", icon: Heart, to: null },
  { key: "word", label: "Word", icon: Sun, to: null },
  { key: "learn", label: "Learn", icon: BookOpen, to: null },
  { key: "reflect", label: "Reflect", icon: NotebookPen, to: null },
];


export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border/70 bg-parchment/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl tracking-wide text-foreground">
            Faith Journey
          </Link>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Monday
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">{children}</main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 border-t border-border/70 bg-parchment/95 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-2 py-2">
          {navItems.map(({ key, label, icon: Icon, to }) => (
            <li key={key} className="flex-1">
              {to ? (
                <Link
                  to={to}
                  activeOptions={{ exact: true }}
                  className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              ) : (
                <span
                  aria-disabled
                  title="Coming in a later phase"
                  className="flex cursor-default flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] text-muted-foreground/50"
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
