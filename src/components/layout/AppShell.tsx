import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { AppNav } from "./AppNav";

export function AppShell({ children }: { children: ReactNode }) {
  const [today, setToday] = useState<string>("");
  // Rendered after mount only: the server/client clock can straddle midnight.
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6 md:pl-60">
      <header className="border-b border-border/70 bg-parchment/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4 lg:max-w-3xl">
          {/* Brand lives in the SideNav on md+, so hide it here to avoid duplication. */}
          <Link
            to="/"
            className="font-display text-xl tracking-wide text-foreground md:hidden"
          >
            Faith Journey
          </Link>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground md:ml-auto">
            {today}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6 lg:max-w-3xl">{children}</main>

      <AppNav />
    </div>
  );
}
