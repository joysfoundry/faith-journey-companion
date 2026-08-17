import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const today = new Date();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border/70 bg-parchment/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl tracking-wide text-foreground">
            Faith Journey
          </Link>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {today.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">{children}</main>

      <BottomNav />
    </div>
  );
}
