import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * One Home section rendered as a single card: a titled header with icon/overflow
 * actions in the top corner, then its items stacked directly inside (divided by
 * hairlines, no nested cards). Keeps sections visually distinct instead of the
 * old bare headings that blended into the page.
 */
export function SectionCard({
  title,
  actions,
  children,
  bodyClassName,
}: {
  title: string;
  /** Icon buttons / an overflow menu shown at the top-right of the header. */
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <Card className="overflow-hidden border-border/70">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
          {title}
        </h2>
        {actions ? <div className="-my-1 flex shrink-0 items-center gap-0.5">{actions}</div> : null}
      </div>
      <div className={cn(bodyClassName)}>{children}</div>
    </Card>
  );
}

/** A single stacked row inside a SectionCard body. */
export function SectionRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
