import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { BottomNav } from "./BottomNav";

/**
 * Inner-page shell: title, optional subtitle, action slot, and back link.
 * Named AppShell for compatibility with the prayer screens.
 */
export function AppShell({
  title,
  subtitle,
  action,
  back,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
  back?: { to: string; label: string } | undefined;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-2xl px-5 pt-8">
        {back ? (
          <Link
            to={back.to as "/"}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
          >
            <ChevronLeft className="size-4" /> {back.label}
          </Link>
        ) : null}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="page-title text-foreground">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {action}
        </header>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
