import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookMarked, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  contentTitle,
  defaultSourceCategory,
  isQuote,
  sourceItemOf,
} from "@/lib/prayer/knowledge";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { KnowledgeCategory, KnowledgeItem } from "@/lib/prayer/types";

/**
 * Tie a quote to the content it came from (ACTS-183). One generic link
 * (`source_item_id`) that composes across every content category — pick an
 * existing book / podcast / video / article / post, or mint one from the quote
 * when it isn't in the library yet. Linking fills the quote's title (`source`)
 * and author (Vessel / `creator`) **only if empty** — it never clobbers what was
 * typed. Shown in the quote editor; the reverse ("Quotes from this") lives on the
 * source item's own detail page.
 */
export function QuoteSourcePicker({ item }: { item: KnowledgeItem }) {
  const { db, updateKnowledgeItem, addKnowledgeItem } = useApp();
  const [query, setQuery] = useState("");
  const [minting, setMinting] = useState(false);
  const [newTitle, setNewTitle] = useState(item.source?.trim() ?? "");
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>(defaultSourceCategory(item));

  const linked = sourceItemOf(item, db.knowledge_items);

  // Candidates: every non-quote content item except this one. (A quote can't be
  // its own source, and quotes aren't "content you saved a quote from".)
  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.knowledge_items
      .filter((i) => i.id !== item.id && !isQuote(i))
      .filter((i) => (q ? i.title.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [db.knowledge_items, item.id, query]);

  /** Link this quote to an existing content item, filling blanks only. */
  function link(source: KnowledgeItem) {
    // The quote already has an author when EITHER a Vessel (`voice_id`) OR a
    // free-text `creator` is set — inherit the source's author only when neither
    // is, so linking never overrides the displayed byline (fill-if-empty).
    const keepAuthor = !!item.voice_id || !!item.creator?.trim();
    updateKnowledgeItem({
      ...item,
      source_item_id: source.id,
      source: item.source?.trim() ? item.source : source.title || undefined,
      voice_id: keepAuthor ? item.voice_id : source.voice_id,
      creator: keepAuthor ? item.creator : source.creator,
    });
    setQuery("");
    setMinting(false);
  }

  /** Mint a new content item from the quote, then link to it. */
  function addAsContent() {
    const title = newTitle.trim() || item.source?.trim();
    if (!title) return;
    const id = newId("know");
    addKnowledgeItem({
      id,
      title,
      category: newCategory,
      // Carry the quote's author across to the new content item.
      voice_id: item.voice_id,
      creator: item.voice_id ? undefined : item.creator,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    updateKnowledgeItem({
      ...item,
      source_item_id: id,
      source: item.source?.trim() ? item.source : title,
    });
    setMinting(false);
    setNewTitle("");
  }

  function unlink() {
    updateKnowledgeItem({ ...item, source_item_id: undefined });
  }

  return (
    <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3">
      <label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <BookMarked className="size-3.5" aria-hidden /> From (source content)
      </label>

      {linked ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-3 py-2">
          <Link
            to="/knowledge/$knowledgeId"
            params={{ knowledgeId: linked.id }}
            className="min-w-0"
          >
            <span className="block truncate text-sm font-medium text-foreground">
              {contentTitle(linked)}
            </span>
            <span className="block text-xs text-muted-foreground">
              {CATEGORY_LABELS[linked.category]}
            </span>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 shrink-0"
            aria-label="Unlink source"
            onClick={unlink}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your library — a book, podcast, video…"
              className="h-9 pl-9"
              aria-label="Search content to link"
            />
          </div>

          {candidates.length ? (
            <ul className="space-y-1">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => link(c)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-left transition-colors hover:border-primary/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{c.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {CATEGORY_LABELS[c.category]}
                      </span>
                    </span>
                    <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <p className="text-xs text-muted-foreground">Nothing in your library matches.</p>
          ) : null}

          {minting ? (
            <div className="space-y-2 rounded-md border border-border/60 bg-background p-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title of the book / podcast / video…"
                className="h-9"
                aria-label="New content title"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as KnowledgeCategory)}
                aria-label="Content type"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {CATEGORY_OPTIONS.filter((c) => c !== "quote").map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-9 flex-1 gap-1.5"
                  onClick={addAsContent}
                  disabled={!newTitle.trim() && !item.source?.trim()}
                >
                  <Plus className="size-4" aria-hidden /> Add &amp; link
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9"
                  onClick={() => setMinting(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setNewTitle(item.source?.trim() ?? query.trim());
                setNewCategory(defaultSourceCategory(item));
                setMinting(true);
              }}
            >
              <Plus className="size-4" aria-hidden /> Add as content
            </Button>
          )}
        </>
      )}
    </div>
  );
}
