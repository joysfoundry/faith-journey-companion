import { useState } from "react";
import { BookmarkPlus, Check, ExternalLink, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { OpenInBibleLink } from "@/components/knowledge/OpenInBibleLink";
import { todaysWord } from "@/domain/placeholderData";
import { newId } from "@/lib/prayer/compiler";
import { resolveInspirations, type ResolvedInspiration } from "@/lib/prayer/inspiration";
import { useApp } from "@/lib/prayer/store";
import type { Database, ReflectionLink } from "@/lib/prayer/types";

/** Deep-link out to the daily readings — the one entity whose text we never store. */
function hrefFor(resolved: ResolvedInspiration): string | undefined {
  if (resolved.href) return resolved.href;
  if (resolved.link.target_type === "daily_reading") return todaysWord.readingsUrl;
  return undefined;
}

function InspirationCard({
  resolved,
  onSaveQuote,
  saved,
  onRemove,
}: {
  resolved: ResolvedInspiration;
  /** Provided only where saving is offered; called for a savable passage card. */
  onSaveQuote?: ((resolved: ResolvedInspiration) => void) | undefined;
  saved?: boolean | undefined;
  /** Provided in the composer so a linked inspiration can be un-linked from the card. */
  onRemove?: ((resolved: ResolvedInspiration) => void) | undefined;
}) {
  const href = hrefFor(resolved);
  // A pasted `passage` carries its own text — the one inspiration you can keep as a
  // library quote (ACTS-181). Entity links resolve to a reference, not text to save.
  const canSaveQuote = !!onSaveQuote && resolved.link.target_type === "passage" && !!resolved.text;
  return (
    <div className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        {/* A quote card leads with its Vessel (or nothing) — the bold title is just
            the truncated body, redundant with the quote text below (JC). */}
        {resolved.isQuote ? (
          <p className="min-w-0 truncate text-xs text-muted-foreground">{resolved.detail ?? ""}</p>
        ) : (
          <p className="min-w-0 truncate font-medium text-foreground">{resolved.label}</p>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {resolved.scriptureRef ? <OpenInBibleLink reference={resolved.scriptureRef} /> : null}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open <ExternalLink className="size-3" aria-hidden />
            </a>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(resolved)}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={`Remove ${resolved.label}`}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      {!resolved.isQuote && resolved.detail ? (
        <p className="text-xs text-muted-foreground">{resolved.detail}</p>
      ) : null}
      {resolved.text ? (
        <p className="mt-1.5 whitespace-pre-line border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
          {resolved.text}
        </p>
      ) : null}
      {canSaveQuote ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onSaveQuote?.(resolved)}
            disabled={saved}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {saved ? (
              <>
                <Check className="size-3" aria-hidden /> Saved to library
              </>
            ) : (
              <>
                <BookmarkPlus className="size-3" aria-hidden /> Save as quote
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The "inspiration in view" panel (ACTS-103): shows what prompted a reflection —
 * a reference card for linked entities, or the pasted passage / quote text
 * verbatim. Renders nothing when there is no inspiration to show.
 *
 * A pasted passage can be kept as a library quote (ACTS-181, "Save → keep"): the
 * one inspiration that carries its own text, minted as an `open` quote so it can be
 * found, reflected from again, or typed as Scripture/book later.
 */
export function InspirationPanel({
  links,
  db,
  className,
  onRemove,
}: {
  links: ReflectionLink[];
  db: Database;
  className?: string;
  /** Composer-only: remove a linked inspiration (by its resolved link). */
  onRemove?: ((resolved: ResolvedInspiration) => void) | undefined;
}) {
  const { addKnowledgeItem } = useApp();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  if (links.length === 0) return null;
  const resolved = resolveInspirations(links, db);

  function saveQuote(r: ResolvedInspiration) {
    const body = r.text?.trim();
    if (!body) return;
    const source = r.link.label?.trim();
    addKnowledgeItem({
      id: newId("know"),
      title: "", // a quote's payload is its body, not a title
      category: "quote",
      quote_kind: "open",
      body,
      // The passage's "Source" field (e.g. "Story of a Soul"), when the reader gave
      // one — the default "Passage" placeholder isn't a real source.
      source: source && source !== "Passage" ? source : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    setSavedIds((s) => new Set(s).add(r.link.target_id));
    toast.success("Saved to your library");
  }

  return (
    <div className={className}>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Sparkles className="size-3" aria-hidden />
        What inspired this
      </p>
      <div className="space-y-1.5">
        {resolved.map((r) => (
          <InspirationCard
            key={`${r.link.target_type}:${r.link.target_id}`}
            resolved={r}
            onSaveQuote={saveQuote}
            saved={savedIds.has(r.link.target_id)}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
