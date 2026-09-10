import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Check,
  Flame,
  Globe,
  Link2,
  MessageSquareQuote,
  Trash2,
} from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";

import { InspirationPanel } from "@/components/reflections/InspirationPanel";
import { RichTextArea } from "@/components/reflections/RichTextArea";
import { ThemeEditor } from "@/components/reflections/ThemeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { LinkableItem } from "@/domain/placeholderData";
import { newId, todayISO } from "@/lib/prayer/compiler";
import { QUOTE_KIND_LABELS, QUOTE_KIND_OPTIONS, detectPlatform } from "@/lib/prayer/knowledge";
import { LECTIO_TEMPLATE_ID } from "@/lib/prayer/seed";
import {
  clearReflectionDraft,
  hasDraftContent,
  loadReflectionDraft,
  saveReflectionDraft,
} from "@/lib/prayer/reflectionDraft";
import { useApp } from "@/lib/prayer/store";
import { suggestThemes, themeHistory } from "@/lib/prayer/themes";
import type { QuoteKind, ReflectionLink, ReflectionLinkTarget } from "@/lib/prayer/types";

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
  // The linkables builder names the library group "Knowledge"; both keys map to
  // the `learning` target so a reflected-from item (incl. a quote) resolves its
  // body in the inspiration panel rather than degrading to a generic intention.
  Knowledge: "learning",
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
  const { db, addReflection, addKnowledgeItem, startSession } = useApp();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [linked, setLinked] = useState<string[]>([]);
  // Non-entity sources the user attaches directly: saved quotes (a `learning` link
  // to a minted quote, ACTS-181) and web `link`s.
  const [manualLinks, setManualLinks] = useState<ReflectionLink[]>([]);
  // "Quote that inspired this" — mirrors the library's quote-add (kind + fields) and
  // saves a real quote, rather than a throwaway passage. `From` is the free-text who,
  // since this surface has no Vessel picker.
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteKind, setQuoteKind] = useState<QuoteKind>("open");
  const [quoteText, setQuoteText] = useState("");
  const [quoteFrom, setQuoteFrom] = useState("");
  const [quoteSource, setQuoteSource] = useState("");
  const [quoteRef, setQuoteRef] = useState("");
  const [quoteUrl, setQuoteUrl] = useState("");
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
    saveReflectionDraft({ title, body, mode: "written", themes, linked, manualLinks });
  }, [hydrated, title, body, themes, linked, manualLinks]);

  const groups = Array.from(new Set(linkables.map((l) => l.group)));

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

  /**
   * Save the quote that inspired this reflection (ACTS-181, "Save → keep"). Mints a
   * real library quote — typed like the library's add form — and links the reflection
   * to it via a `learning` link, so it lives on in the library and can be reflected
   * from again. No throwaway `passage` link.
   */
  function addQuote() {
    const body = quoteText.trim();
    if (!body) return;
    const id = newId("know");
    const isScripture = quoteKind === "scripture";
    const takesSource = quoteKind === "book" || quoteKind === "article";
    const url = normalizeUrl(quoteUrl);
    addKnowledgeItem({
      id,
      title: "", // a quote's payload is its body, not a title
      category: "quote",
      quote_kind: quoteKind,
      body,
      scripture_ref: isScripture ? quoteRef.trim() || undefined : undefined,
      // The free-text "From" (who/where, or the author) — this surface has no Vessel.
      creator: !isScripture ? quoteFrom.trim() || undefined : undefined,
      // The work: a book title or a publication/show.
      source: takesSource ? quoteSource.trim() || undefined : undefined,
      links: !isScripture && url ? [{ platform: detectPlatform(url), url }] : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    const label = body.length > 60 ? `${body.slice(0, 57).trimEnd()}…` : body;
    setManualLinks((prev) => [
      ...prev,
      { target_type: "learning", target_id: id, label },
    ]);
    setQuoteKind("open");
    setQuoteText("");
    setQuoteFrom("");
    setQuoteSource("");
    setQuoteRef("");
    setQuoteUrl("");
    setQuoteOpen(false);
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

  const hasQuote = manualLinks.some((l) => l.target_type === "learning");
  const hasWebLink = manualLinks.some((l) => l.target_type === "link");

  /** Wipe every composer field back to blank. Callers also clear the draft. */
  function resetComposer() {
    setTitle("");
    setBody("");
    setThemes([]);
    setLinked([]);
    setManualLinks([]);
  }

  function save() {
    if (!body.trim()) return;
    addReflection({
      id: newId("reflection"),
      title: title.trim() || undefined,
      body: body.trim(),
      mode: "written",
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
        <RichTextArea
          value={body}
          onChange={setBody}
          placeholder="What's on your heart today? What did you learn?"
          rows={4}
          ariaLabel="Your reflection"
        />

        {/* What inspired this — the add-icons sit right above the chips/blocks they
            produce, directly under the text box (ACTS-181 layout). */}
        <div className="flex flex-wrap items-center gap-1">
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

          <Popover open={quoteOpen} onOpenChange={setQuoteOpen}>
            <PopoverTrigger asChild>
              <IconBtn
                label="Add a quote"
                active={hasQuote}
                title="Save the quote that inspired this"
              >
                <MessageSquareQuote className="size-4" aria-hidden />
              </IconBtn>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-2 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Quote that inspired this
              </p>
              {/* Kind chooser — mirrors the library's quote-add (ACTS-181). */}
              <div className="flex flex-wrap gap-1">
                {QUOTE_KIND_OPTIONS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={quoteKind === k}
                    onClick={() => setQuoteKind(k)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      quoteKind === k
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {QUOTE_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
              <Textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder={quoteKind === "scripture" ? "Paste or type the passage…" : "Paste or type the quote…"}
                rows={4}
              />
              {quoteKind === "scripture" ? (
                <Input
                  value={quoteRef}
                  onChange={(e) => setQuoteRef(e.target.value)}
                  placeholder="Citation — e.g. Lk 1:26-38"
                  className="h-8 text-sm"
                />
              ) : (
                <>
                  {quoteKind === "book" || quoteKind === "article" ? (
                    <Input
                      value={quoteSource}
                      onChange={(e) => setQuoteSource(e.target.value)}
                      placeholder={quoteKind === "book" ? "Book title (optional)" : "Publication or show (optional)"}
                      className="h-8 text-sm"
                    />
                  ) : null}
                  <Input
                    value={quoteFrom}
                    onChange={(e) => setQuoteFrom(e.target.value)}
                    placeholder={
                      quoteKind === "open"
                        ? "From — who or where you heard it"
                        : "From — author (optional)"
                    }
                    className="h-8 text-sm"
                  />
                  <Input
                    value={quoteUrl}
                    onChange={(e) => setQuoteUrl(e.target.value)}
                    placeholder="Link (optional)"
                    className="h-8 text-sm"
                    inputMode="url"
                  />
                </>
              )}
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={addQuote} disabled={!quoteText.trim()}>
                  Save quote
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

        </div>

        {/* No chips — the "What inspired this" cards below are the single view, each
            with its own remove (JC). */}
        <InspirationPanel
          links={allLinks}
          db={db}
          className="pt-1"
          onRemove={(r) =>
            linked.includes(r.link.target_id)
              ? toggleLink(r.link.target_id)
              : removeManualLink(r.link.target_id)
          }
        />

        <ThemeEditor
          value={themes}
          onChange={setThemes}
          suggestions={suggestions}
          historyThemes={history.map((h) => h.theme)}
        />

        <div className="flex items-center justify-end gap-1">
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
  );
}
