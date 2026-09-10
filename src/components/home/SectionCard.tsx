import type { ReactNode } from "react";

import { ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/**
 * One Home section rendered as a single card: a titled header with icon/overflow
 * actions in the top corner, then its items stacked directly inside (divided by
 * hairlines, no nested cards). Keeps sections visually distinct instead of the
 * old bare headings that blended into the page.
 *
 * Pass `collapsible` (with controlled `open`/`onOpenChange`) to turn the header
 * into a chevron toggle that shows/hides the body.
 */
export function SectionCard({
  title,
  actions,
  children,
  bodyClassName,
  collapsible = false,
  open,
  onOpenChange,
}: {
  title: string;
  /** Icon buttons / an overflow menu shown at the top-right of the header. */
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  /** When true, the header becomes a chevron toggle over the body. */
  collapsible?: boolean;
  /** Controlled open state (only meaningful with `collapsible`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  if (collapsible) {
    // Only forward onOpenChange when provided (exactOptionalPropertyTypes).
    const collapsibleProps = {
      open: open ?? false,
      ...(onOpenChange ? { onOpenChange } : {}),
    };
    return (
      <Card className="overflow-hidden border-border/70">
        <Collapsible {...collapsibleProps}>
          <div
            className={cn(
              "flex items-center justify-between gap-3 bg-muted/40 px-5 py-3",
              // Only draw the header's bottom hairline when the body is showing,
              // so a collapsed card doesn't stack two rules at its foot.
              open && "border-b border-border/60",
            )}
          >
            <CollapsibleTrigger className="group -my-1 flex flex-1 items-center gap-2 py-1 text-left">
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
                aria-hidden
              />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
                {title}
              </h2>
            </CollapsibleTrigger>
            {actions ? (
              <div className="-my-1 flex shrink-0 items-center gap-0.5">{actions}</div>
            ) : null}
          </div>
          <CollapsibleContent>
            <div className={cn(bodyClassName)}>{children}</div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

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
