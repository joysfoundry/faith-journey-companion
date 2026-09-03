import { BookOpen, Camera, Check, Link2, MessagesSquare, X } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";

import { InspirationPanel } from "@/components/reflections/InspirationPanel";
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

/**
 * Icon-only action button. Label kept for a11y + tooltip; no visible text.
 * Forwards its ref and spreads extra props so it can serve as a Radix
 * `PopoverTrigger asChild` — without the ref, Radix can't anchor the popover to
 * the button and the content renders off-canvas.
 */
const IconBtn = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
  } & React.ComponentPropsWithoutRef<typeof Button>
>(function IconBtn({ label, onClick, active, disabled, title, children, ...rest }, ref) {
  return (
    <Button
      ref={ref}
      type="button"
      size="icon"
      variant="ghost"
      className={`size-9 ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
      {...rest}
    >
      {children}
    </Button>
  );
});

/**
 * Free-text journal entry with optional title/theme, photos, and links to the
 * session, reading, or learning item that prompted it. Links are stored with
 * the reflection, never on the item that inspired it. Renders as flat rows meant
 * to sit inside the Home "Reflection" SectionCard.
 */
export function ReflectionComposer({ linkables, prefillLinkId }: Props) {
  const { db, addReflection } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"written" | "open_dialogue">("written");
  const [linked, setLinked] = useState<string[]>([]);
  const [passages, setPassages] = useState<ReflectionLink[]>([]);
  const [passageText, setPassageText] = useState("");
  const [passageLabel, setPassageLabel] = useState("");
  const [passageOpen, setPassageOpen] = useState(false);

  useEffect(() => {
    if (!prefillLinkId) return;
    setLinked((prev) => (prev.includes(prefillLinkId) ? prev : [...prev, prefillLinkId]));
  }, [prefillLinkId]);

  const groups = Array.from(new Set(linkables.map((l) => l.group)));
  const labelFor = (id: string) => linkables.find((l) => l.id === id)?.label ?? id;

  function toggleLink(id: string) {
    setLinked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  /** Entity links from the currently-selected linkable ids. */
  function entityLinks(): ReflectionLink[] {
    return linked.map((id) => {
      const item = linkables.find((l) => l.id === id);
      return {
        target_type: (item && GROUP_TARGET[item.group]) ?? "intention",
        target_id: id,
        label: item?.label,
      };
    });
  }

  /** Everything that inspired the entry: linked entities + pasted passages. */
  const allLinks = useMemo(
    () => [...entityLinks(), ...passages],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linked, passages, linkables],
  );

  function addPassage() {
    if (!passageText.trim()) return;
    setPassages((prev) => [
      ...prev,
      {
        target_type: "passage",
        target_id: newId("passage"),
        label: passageLabel.trim() || "Passage",
        excerpt: passageText.trim(),
      },
    ]);
    setPassageText("");
    setPassageLabel("");
    setPassageOpen(false);
  }

  function removePassage(id: string) {
    setPassages((prev) => prev.filter((p) => p.target_id !== id));
  }

  function save() {
    if (!body.trim()) return;
    addReflection({
      id: newId("reflection"),
      title: title.trim() || undefined,
      body: body.trim(),
      mode,
      links: allLinks,
      photo_count: 0,
      created_at: new Date().toISOString(),
    });
    setTitle("");
    setBody("");
    setLinked([]);
    setPassages([]);
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

        {(linked.length > 0 || passages.length > 0) && (
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
            {passages.map((p) => (
              <Badge
                key={p.target_id}
                variant="outline"
                className="gap-1 pr-1.5 font-normal"
                title={p.excerpt}
              >
                <BookOpen className="size-3" aria-hidden />
                {p.label}
                <button
                  type="button"
                  onClick={() => removePassage(p.target_id)}
                  className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${p.label ?? "passage"}`}
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <InspirationPanel links={allLinks} db={db} className="pt-1" />

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

          <Popover open={passageOpen} onOpenChange={setPassageOpen}>
            <PopoverTrigger asChild>
              <IconBtn
                label="Add a passage"
                active={passages.length > 0}
                title="Paste a book or quote passage"
              >
                <BookOpen className="size-4" aria-hidden />
              </IconBtn>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-2 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Passage that inspired this
              </p>
              <Input
                value={passageLabel}
                onChange={(e) => setPassageLabel(e.target.value)}
                placeholder="Source (optional) — e.g. Story of a Soul"
                className="h-8 text-sm"
              />
              <Textarea
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                placeholder="Paste or type the passage…"
                rows={4}
              />
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={addPassage} disabled={!passageText.trim()}>
                  Add passage
                </Button>
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
