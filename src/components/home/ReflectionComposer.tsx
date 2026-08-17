import { Camera, Link2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
import type { LinkableItem, ReflectionEntry } from "@/domain/placeholderData";

interface Props {
  linkables: LinkableItem[];
  entries: ReflectionEntry[];
}

/**
 * Free-text journal entry with optional title/theme, photos, and links to the
 * session, need, reading, or learning item that prompted it. Links are stored
 * with the reflection, never on the item that inspired it.
 */
export function ReflectionComposer({ linkables, entries }: Props) {
  const [saved, setSaved] = useState<ReflectionEntry[]>(entries);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linked, setLinked] = useState<string[]>([]);

  const groups = Array.from(new Set(linkables.map((l) => l.group)));

  function toggleLink(id: string) {
    setLinked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (!body.trim()) return;
    setSaved((prev) => [
      ...prev,
      {
        id: `reflection-${prev.length + 1}`,
        title: title.trim() || "Untitled reflection",
        body: body.trim(),
        linkedItemIds: linked,
        photoCount: 0,
      },
    ]);
    setTitle("");
    setBody("");
    setLinked([]);
  }

  return (
    <div className="space-y-3">
      {saved.map((entry) => (
        <Card key={entry.id} className="border-border/70">
          <CardContent className="space-y-2 py-5">
            <p className="font-display text-lg text-foreground">{entry.title}</p>
            <p className="text-sm text-muted-foreground">{entry.body}</p>
            {entry.linkedItemIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {entry.linkedItemIds.map((id) => (
                  <Badge key={id} variant="secondary" className="font-normal">
                    {linkables.find((l) => l.id === id)?.label ?? id}
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
                <Badge key={id} variant="secondary" className="font-normal">
                  {linkables.find((l) => l.id === id)?.label ?? id}
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

            <Button size="sm" onClick={save} disabled={!body.trim()} className="ml-auto">
              <Plus className="size-4" aria-hidden />
              Save entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
