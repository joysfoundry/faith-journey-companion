import { Camera, Link2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { todayISO } from "@/lib/prayer/compiler";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { LinkableItem } from "@/domain/placeholderData";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { ReflectionLink, ReflectionLinkTarget } from "@/lib/prayer/types";

interface Props {
  linkables: LinkableItem[];
  /** Item id to pre-link when the user arrives via a "Reflect" icon (provenance). */
  prefillLinkId?: string | null;
}

const GROUP_TARGET: Record<string, ReflectionLinkTarget> = {
  "Prayer & devotion": "prayer_session",
  Word: "daily_reading",
  Learn: "learning",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Free-text journal entry with optional title/theme, photos, and links to the
 * session, reading, or learning item that prompted it. Links are stored with
 * the reflection, never on the item that inspired it. Persisted in the store.
 */
export function ReflectionComposer({ linkables, prefillLinkId }: Props) {
  const { db, addReflection } = useApp();
  const saved = db.reflections;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"written" | "open_dialogue">("written");
  const [linked, setLinked] = useState<string[]>([]);

  useEffect(() => {
    if (!prefillLinkId) return;
    setLinked((prev) => (prev.includes(prefillLinkId) ? prev : [...prev, prefillLinkId]));
  }, [prefillLinkId]);

  const groups = Array.from(new Set(linkables.map((l) => l.group)));
  const labelFor = (id: string) => linkables.find((l) => l.id === id)?.label ?? id;

  function toggleLink(id: string) {
    setLinked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (!body.trim()) return;
    const links: ReflectionLink[] = linked.map((id) => {
      const item = linkables.find((l) => l.id === id);
      return {
        target_type: (item && GROUP_TARGET[item.group]) ?? "intention",
        target_id: id,
        label: item?.label,
      };
    });
    addReflection({
      id: newId("reflection"),
      title: title.trim() || undefined,
      body: body.trim(),
      mode,
      links,
      photo_count: 0,
      created_at: new Date().toISOString(),
    });
    setTitle("");
    setBody("");
    setLinked([]);
    setMode("written");
  }

  return (
    <div className="space-y-3">
      {saved.map((entry) => (
        <Card key={entry.id} className="border-border/70">
          <CardContent className="space-y-2 py-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-display text-lg text-foreground">
                {entry.title ?? "Reflection"}
              </p>
              <time className="shrink-0 text-xs text-muted-foreground">
                {formatWhen(entry.created_at)}
              </time>
            </div>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{entry.body}</p>
            {(entry.links.length > 0 || entry.mode === "open_dialogue") && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {entry.mode === "open_dialogue" && (
                  <Badge variant="outline" className="font-normal">
                    Open dialogue
                  </Badge>
                )}
                {entry.links.map((link) => (
                  <Badge key={link.target_id} variant="secondary" className="font-normal">
                    {link.label ?? labelFor(link.target_id)}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="border-border/70 shadow-devotional">
        <CardContent className="space-y-3 py-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title or theme (optional)"
            className="border-0 border-b border-border/70 px-0 font-display text-lg shadow-none focus-visible:ring-0"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What stayed with you today?"
            rows={4}
          />

          {linked.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {linked.map((id) => (
                <Badge key={id} variant="secondary" className="gap-1 pr-1.5 font-normal">
                  {linkables.find((l) => l.id === id)?.label ?? id}
                  <button
                    type="button"
                    onClick={() => toggleLink(id)}
                    className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={`Remove ${linkables.find((l) => l.id === id)?.label ?? id}`}
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" disabled title="Photos land with the Cloud phase">
              <Camera className="size-4" aria-hidden />
              Add photo
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <Link2 className="size-4" aria-hidden />
                  Link an item
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-2">
                <div className="max-h-72 space-y-3 overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group}>
                      <p className="px-2 pb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {group}
                      </p>
                      {linkables
                        .filter((l) => l.group === group)
                        .map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => toggleLink(l.id)}
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent"
                          >
                            <span>{l.label}</span>
                            {linked.includes(l.id) && (
                              <span className="text-xs text-primary">Linked</span>
                            )}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMode((m) => (m === "open_dialogue" ? "written" : "open_dialogue"))}
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: mode === "open_dialogue" ? "hsl(var(--secondary))" : "transparent",
                  color: mode === "open_dialogue" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                }}
                title="Speak or write freely — captured as your own words"
              >
                Open dialogue
              </button>
              <Button size="sm" onClick={save} disabled={!body.trim()}>
                <Plus className="size-4" aria-hidden />
                Save entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
