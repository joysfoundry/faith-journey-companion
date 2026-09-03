import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Camera,
  Check,
  Flame,
  Globe,
  Link2,
  MessagesSquare,
  Trash2,
  X,
} from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";

import { InspirationPanel } from "@/components/reflections/InspirationPanel";
import { ThemeEditor } from "@/components/reflections/ThemeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { LinkableItem } from "@/domain/placeholderData";
import { newId, todayISO } from "@/lib/prayer/compiler";
import { LECTIO_TEMPLATE_ID } from "@/lib/prayer/seed";
import {
  clearReflectionDraft,
  hasDraftContent,
  loadReflectionDraft,
  saveReflectionDraft,
} from "@/lib/prayer/reflectionDraft";
import { useApp } from "@/lib/prayer/store";
import { suggestThemes, themeHistory } from "@/lib/prayer/themes";
import type { ReflectionLink, ReflectionLinkTarget } from "@/lib/prayer/types";

interface Props {
  linkables: LinkableItem[];
  /** Item id to pre-link when the user arrives via a "Reflect" icon (provenance). */
  prefillLinkId?: string | null;
  /**
   * Show an "in progress" affordance when a shared draft has content — reassures
   * the reader that unsaved work is auto-saved and resumable. Enabled on the
   * `/reflections` page (ACTS-136 item 2); Home is the primary compose spot.
   */
  showDraftStatus?: boolean;
}

const GROUP_TARGET: Record<string, ReflectionLinkTarget> = {
  "Prayer & devotion": "prayer_session",
  Word: "daily_reading",
  Learn: "learning",
  Mass: "mass",
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
export function ReflectionComposer({ linkables, prefillLinkId, showDraftStatus }: Props) {
  const { db, addReflection, startSession } = useApp();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"written" | "open_dialogue">("written");
  const [themes, setThemes] = useState<string[]>([]);
  const [linked, setLinked] = useState<string[]>([]);
  // Non-entity sources the user attaches directly: pasted `passage`s and web `link`s.
  const [manualLinks, setManualLinks] = useState<ReflectionLink[]>([]);
  const [passageText, setPassageText] = useState("");
  const [passageLabel, setPassageLabel] = useState("");
  const [passageOpen, setPassageOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  // The shared draft is loaded post-mount (not in lazy init) so the empty SSR
  // render and the client's first render match — reading localStorage during
  // render would be a hydration mismatch. `hydrated` is STATE (not a ref) so the
  // persist effect skips the empty first commit and can't clobber the stored
  // draft before the loaded values land.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const draft = loadReflectionDraft();
    if (draft) {
      setTitle(draft.title);
      setBody(draft.body);
      setMode(draft.mode);
      setThemes(draft.themes);
      setLinked(draft.linked);
      setManualLinks(draft.manualLinks);
    }
    setHydrated(true);
  }, []);

  // A "Reflect" icon pre-links its source; append it to whatever the draft holds.
  useEffect(() => {
    if (!prefillLinkId) return;
    setLinked((prev) => (prev.includes(prefillLinkId) ? prev : [...prev, prefillLinkId]));
  }, [prefillLinkId]);

  // Persist every change so the in-progress entry survives navigating Home ↔
  // Reflect. Skips the pre-hydration window; clears the buffer once it decays to empty.
  useEffect(() => {
    if (!hydrated) return;
    saveReflectionDraft({ title, body, mode, themes, linked, manualLinks });
  }, [hydrated, title, body, mode, themes, linked, manualLinks]);

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

  /** Everything that inspired the entry: linked entities + pasted passages + web links. */
  const allLinks = useMemo(
    () => [...entityLinks(), ...manualLinks],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linked, manualLinks, linkables],
  );

  // Theme suggestions: contextual to what's written, personalized by prior tags. No AI.
  const history = useMemo(() => themeHistory(db.reflections), [db.reflections]);
  const suggestions = useMemo(
    () =>
      suggestThemes(`${title}\n${body}`, {
        history: history.map((h) => h.theme),
        applied: themes,
      }),
    [title, body, themes, history],
  );

  function addPassage() {
    if (!passageText.trim()) return;
    setManualLinks((prev) => [
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

  /** Prepend https:// when the user omits a scheme, so the URL opens out correctly. */
  function normalizeUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      return new URL(withScheme).toString();
    } catch {
      return null;
    }
  }

  function addWebLink() {
    const url = normalizeUrl(linkUrl);
    if (!url) return;
    setManualLinks((prev) => [
      ...prev,
      {
        target_type: "link",
        target_id: newId("link"),
        label: linkLabel.trim() || undefined,
        url,
      },
    ]);
    setLinkUrl("");
    setLinkLabel("");
    setLinkOpen(false);
  }

  function removeManualLink(id: string) {
    setManualLinks((prev) => prev.filter((p) => p.target_id !== id));
  }

  const hasPassage = manualLinks.some((l) => l.target_type === "passage");
  const hasWebLink = manualLinks.some((l) => l.target_type === "link");

  /** Wipe every composer field back to blank. Callers also clear the draft. */
  function resetComposer() {
    setTitle("");
    setBody("");
    setThemes([]);
    setLinked([]);
    setManualLinks([]);
    setMode("written");
  }

  function save() {
    if (!body.trim()) return;
    addReflection({
      id: newId("reflection"),
      title: title.trim() || undefined,
      body: body.trim(),
      mode,
      links: allLinks,
      ...(themes.length > 0 ? { themes } : {}),
      photo_count: 0,
      created_at: new Date().toISOString(),
    });
    clearReflectionDraft();
    resetComposer();
  }

  /** Explicit discard — throw the in-progress draft away without saving. */
  function discard() {
    clearReflectionDraft();
    resetComposer();
  }

  /**
   * Launch a guided Lectio Divina (ACTS-138). Free-writing captures a thought;
   * Lectio is a distinct *practice* — the seeded 4-movement session (ACTS-102),
   * whose per-movement journaling saves back into this same Reflection journal.
   * One tap → a fresh session, no config step (the passage is chosen in-session).
   */
  function startLectio() {
    const session = startSession(LECTIO_TEMPLATE_ID, {
      date: todayISO(),
      progress_mode: "scroll",
    });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  }

  const draftHasContent = hasDraftContent({ title, body, themes, linked, manualLinks });

  // Once you're actually writing, the Lectio entry + "or write freely below"
  // divider collapse away (ACTS-138) so the composer becomes a clean, focused
  // journaling space — the two-intents chooser has done its job by then.
  const isWriting = body.trim().length > 0;

  return (
    <div className="divide-y divide-border/60">
      {/* Guided-practice entry (ACTS-138) — a deliberate front door to Lectio
          Divina, set apart from free-writing because it's a specific process,
          not metadata on a note. Shared by Home + /reflections via this composer.
          Hidden once writing begins, to clear the deck for the journal entry. */}
      {!isWriting && (
        <div className="px-5 py-4">
          <button
            type="button"
            onClick={startLectio}
            className="flex w-full items-center gap-3 rounded-xl border border-primary/40 bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flame className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-medium leading-tight">
                Reflect with Scripture
              </span>
              <span className="block text-sm text-muted-foreground">
                Lectio Divina · read, reflect, respond, rest
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium text-primary">Begin</span>
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="space-y-3 px-5 py-4">
        {!isWriting && (
          <p className="text-center text-xs text-muted-foreground">or write freely below</p>
        )}
        {showDraftStatus && draftHasContent ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            Draft in progress — saved automatically
          </div>
        ) : null}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title or Subject (optional)"
          className="border-0 border-b border-border/70 px-0 font-display text-lg shadow-none focus-visible:ring-0"
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your heart today?"
          rows={4}
        />

        <ThemeEditor
          value={themes}
          onChange={setThemes}
          suggestions={suggestions}
          historyThemes={history.map((h) => h.theme)}
        />

        {(linked.length > 0 || manualLinks.length > 0) && (
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
            {manualLinks.map((l) => (
              <Badge
                key={l.target_id}
                variant="outline"
                className="gap-1 pr-1.5 font-normal"
                title={l.target_type === "passage" ? l.excerpt : l.url}
              >
                {l.target_type === "passage" ? (
                  <BookOpen className="size-3" aria-hidden />
                ) : (
                  <Globe className="size-3" aria-hidden />
                )}
                {l.label ?? (l.target_type === "passage" ? "Passage" : "Link")}
                <button
                  type="button"
                  onClick={() => removeManualLink(l.target_id)}
                  className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${l.label ?? l.target_type}`}
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
                active={hasPassage}
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

          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <IconBtn label="Add a link" active={hasWebLink} title="Attach a related web link">
                <Globe className="size-4" aria-hidden />
              </IconBtn>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-2 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Related link
              </p>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addWebLink();
                  }
                }}
                placeholder="Paste a URL — e.g. bible.usccb.org/…"
                className="h-8 text-sm"
                inputMode="url"
              />
              <Input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Label (optional) — e.g. Today's Gospel"
                className="h-8 text-sm"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={addWebLink}
                  disabled={!normalizeUrl(linkUrl)}
                >
                  Add link
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

          <div className="ml-auto flex items-center gap-1">
            {draftHasContent ? (
              <IconBtn
                label="Discard draft"
                onClick={discard}
                title="Discard this in-progress draft"
              >
                <Trash2 className="size-4" aria-hidden />
              </IconBtn>
            ) : null}
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
