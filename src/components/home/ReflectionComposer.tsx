import { Camera, Check, Link2, MessagesSquare, X } from "lucide-react";
import { useEffect, useState } from "react";

import { todayISO } from "@/lib/prayer/compiler";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

/** Icon-only action button. Label kept for a11y + tooltip; no visible text. */
function IconBtn({
  label,
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={`size-9 ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
    >
      {children}
    </Button>
  );
}

/**
 * Free-text journal entry with optional title/theme, photos, and links to the
 * session, reading, or learning item that prompted it. Links are stored with
 * the reflection, never on the item that inspired it. Renders as flat rows meant
 * to sit inside the Home "Reflection" SectionCard.
 */
export function ReflectionComposer({ linkables, prefillLinkId }: Props) {
  const { addReflection } = useApp();
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
    <div className="divide-y divide-border/60">
      {/* Composer */}
      <div className="space-y-3 px-5 py-4">
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
                {labelFor(id)}
                <button
                  type="button"
                  onClick={() => toggleLink(id)}
                  className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${labelFor(id)}`}
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          <IconBtn label="Add photo" disabled title="Photos land with the Cloud phase">
            <Camera className="size-4" aria-hidden />
          </IconBtn>

          <Popover>
            <PopoverTrigger asChild>
              <IconBtn label="Link an item" active={linked.length > 0}>
                <Link2 className="size-4" aria-hidden />
              </IconBtn>
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

          <IconBtn
            label="Open dialogue — speak or write freely, captured as your own words"
            active={mode === "open_dialogue"}
            onClick={() => setMode((m) => (m === "open_dialogue" ? "written" : "open_dialogue"))}
          >
            <MessagesSquare className="size-4" aria-hidden />
          </IconBtn>

          <div className="ml-auto">
            <Button
              type="button"
              size="icon"
              className="size-9"
              onClick={save}
              disabled={!body.trim()}
              aria-label="Save entry"
              title="Save entry"
            >
              <Check className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
