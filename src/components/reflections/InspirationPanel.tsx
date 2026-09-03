import { ExternalLink, Sparkles } from "lucide-react";

import { todaysWord } from "@/domain/placeholderData";
import { resolveInspirations, type ResolvedInspiration } from "@/lib/prayer/inspiration";
import type { Database, ReflectionLink } from "@/lib/prayer/types";

/** Deep-link out to the daily readings — the one entity whose text we never store. */
function hrefFor(resolved: ResolvedInspiration): string | undefined {
  if (resolved.href) return resolved.href;
  if (resolved.link.target_type === "daily_reading") return todaysWord.readingsUrl;
  return undefined;
}

function InspirationCard({ resolved }: { resolved: ResolvedInspiration }) {
  const href = hrefFor(resolved);
  return (
    <div className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate font-medium text-foreground">{resolved.label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
          >
            Open <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : null}
      </div>
      {resolved.detail ? <p className="text-xs text-muted-foreground">{resolved.detail}</p> : null}
      {resolved.text ? (
        <p className="mt-1.5 whitespace-pre-line border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
          {resolved.text}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The "inspiration in view" panel (ACTS-103): shows what prompted a reflection —
 * a reference card for linked entities, or the pasted passage / quote text
 * verbatim. Renders nothing when there is no inspiration to show.
 */
export function InspirationPanel({
  links,
  db,
  className,
}: {
  links: ReflectionLink[];
  db: Database;
  className?: string;
}) {
  if (links.length === 0) return null;
  const resolved = resolveInspirations(links, db);
  return (
    <div className={className}>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Sparkles className="size-3" aria-hidden />
        What inspired this
      </p>
      <div className="space-y-1.5">
        {resolved.map((r) => (
          <InspirationCard key={`${r.link.target_type}:${r.link.target_id}`} resolved={r} />
        ))}
      </div>
    </div>
  );
}
