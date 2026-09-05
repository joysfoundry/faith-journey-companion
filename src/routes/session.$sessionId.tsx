import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  NotebookPen,
  Pencil,
  Share2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemView } from "@/components/prayer/ItemView";
import { RichTextArea } from "@/components/reflections/RichTextArea";
import { ShareDialog } from "@/components/prayer/ShareDialog";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/prayer/store";
import {
  estimateMinutes,
  occurrenceInfo,
  ordinalWord,
  sessionProgress,
} from "@/lib/prayer/compiler";
import { buildSharePayload } from "@/lib/prayer/share";
import { buildPassageUrl, resolveBibleHomeUrl } from "@/lib/bible/apps";
import { LECTIO_TEMPLATE_ID } from "@/lib/prayer/seed";
import type { ListenSource, SessionItem } from "@/lib/prayer/types";
import {
  GUIDE_EXPAND_DEFAULT,
  GUIDE_EXPAND_OPTIONS,
  isStepExpanded,
  type GuideExpandMode,
} from "@/lib/prayer/guideExpansion";

export const Route = createFileRoute("/session/$sessionId")({
  head: () => ({
    meta: [
      { title: "Prayer Mode — Oravia" },
      {
        name: "description",
        content:
          "A distraction-free follow-along prayer session: every prayer, in order, with your place kept.",
      },
      { property: "og:title", content: "Prayer Mode — Oravia" },
      {
        property: "og:description",
        content: "Follow the full text of every prayer without searching or counting.",
      },
    ],
  }),
  component: PrayerMode,
});

function useKeepAwake(enabled: boolean) {
  const sentinel = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    if (enabled && nav.wakeLock) {
      nav.wakeLock
        .request("screen")
        .then((s) => {
          if (cancelled) void s.release();
          else sentinel.current = s;
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
      void sentinel.current?.release().catch(() => undefined);
      sentinel.current = null;
    };
  }, [enabled]);
}

/** Track the user's reduced-motion preference so auto-scroll can be gentle. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Scroll the current step into view — the tracker's follow-along behavior. Fires
 * when the current step *changes* while this tab is active, and also when this tab
 * *becomes active* (so switching tabs after marking items done lands you on the
 * current "NOW" step). Skips the first mount (the session opens at the top, not
 * mid-list), no-ops while the tab is hidden, and honors reduced-motion.
 */
function useAutoScrollToCurrent<T extends HTMLElement>(
  currentId: string | null,
  active: boolean,
  reducedMotion: boolean,
) {
  const ref = useRef<T | null>(null);
  const mounted = useRef(false);
  const prevId = useRef<string | null>(currentId);
  const prevActive = useRef<boolean>(active);
  useEffect(() => {
    const idChanged = prevId.current !== currentId;
    const becameActive = active && !prevActive.current;
    prevId.current = currentId;
    prevActive.current = active;
    // Skip the very first run so the session opens at its title, not mid-list.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!active || !currentId || (!idChanged && !becameActive)) return;
    const el = ref.current;
    // offsetParent is null while the tab is display:none — skip it.
    if (!el || el.offsetParent === null) return;
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }, [currentId, active, reducedMotion]);
  return ref;
}

function PrayerMode() {
  const { sessionId } = Route.useParams();
  const {
    db,
    ready,
    toggleItemDone,
    finishSession,
    saveSessionReflection,
    setSessionPassage,
    pruneEmptyLectioSession,
  } = useApp();
  const navigate = useNavigate();

  // Reap an abandoned empty Lectio on the explicit way out (ACTS-141) — see
  // `leaveSession` below. Not an unmount effect: this router unmounts/remounts the
  // route mid-navigation, so an unmount prune would delete the session you just
  // opened. The load-time sweep backstops any exit that doesn't go through here.
  const leaveSession = () => {
    navigate({ to: "/" });
    pruneEmptyLectioSession(sessionId);
  };

  const session = db.sessions.find((s) => s.id === sessionId);
  const items = db.session_items
    .filter((i) => i.session_id === sessionId)
    .sort((a, b) => a.position - b.position);

  const [keepAwake, setKeepAwake] = useState(true);
  useKeepAwake(keepAwake);
  const reducedMotion = usePrefersReducedMotion();
  const [tab, setTab] = useState<"prayers" | "guide">("prayers");

  // The "current" step is the first one still incomplete — the place to resume.
  // Null once everything is done.
  const firstOpen = items.find((i) => i.completion_status !== "complete");
  const currentId = firstOpen?.id ?? null;

  if (!ready || !session) {
    return (
      <AppShell title="Prayer session" back={{ to: "/pray", label: "Pray" }}>
        <p className="text-sm text-muted-foreground">Preparing your session…</p>
      </AppShell>
    );
  }

  // An external session is a log of a rosary prayed in another app (e.g. Hallow) —
  // it has no in-app steps, so show a simple record instead of an empty prayer list.
  if (session.external_app) {
    return (
      <AppShell title="Prayer session" back={{ to: "/pray", label: "Pray" }}>
        <div className="soft-card space-y-3 p-6 text-center">
          <p className="font-display text-lg">{session.title}</p>
          <p className="text-sm text-muted-foreground">
            Prayed in {session.external_app}
            {session.completed_at
              ? ` · ${new Date(session.completed_at).toLocaleDateString()}`
              : ""}
            .
          </p>
          {session.external_url ? (
            <ExtLink
              href={session.external_url}
              className="inline-flex items-center gap-1.5 text-sm text-primary underline"
            >
              Open {session.external_app} again
              <ExternalLink className="size-3.5" aria-hidden />
            </ExtLink>
          ) : null}
        </div>
      </AppShell>
    );
  }

  const listen = session.context.listen_source;
  const progress = sessionProgress(items);
  const pct = progress.total ? (progress.done / progress.total) * 100 : 0;
  const estMin = estimateMinutes(items);

  // Lectio Divina: one passage, chosen per session and re-read across movements.
  const isLectio = session.template_id === LECTIO_TEMPLATE_ID;
  const scriptureItem = items.find((i) => i.kind === "scripture");
  const passageRef = scriptureItem?.reference ?? "";
  const passageText = scriptureItem?.body ?? "";
  const bibleUrl = (ref: string) => buildPassageUrl(db.settings, ref);
  const bibleHome = resolveBibleHomeUrl(db.settings);

  // The devotion's own source (editable in the Devotion Builder → Source). Shown
  // under the title so a seeded devotion credits where its steps came from.
  const template = db.templates.find((t) => t.id === session.template_id);
  const source = template?.source_id
    ? db.sources.find((s) => s.id === template.source_id)
    : undefined;
  const sourceLabel = source ? (source.attribution ?? source.name) : "";
  const sourceUrl = source?.url ?? "";

  // "Day 3 of 9" for a bounded recurrence, derived from the plan's series.
  // Count from THIS session's own date, not the plan's `date`: a recurring plan
  // rolls its `date` forward to the next occurrence as sessions finish, so using
  // it would show the plan's current day on every session (including past/future
  // ones). The session captured the day it was prayed in context.date.
  const plan = session.plan_id ? db.session_plans.find((p) => p.id === session.plan_id) : undefined;
  const occ = plan
    ? occurrenceInfo(
        plan.starts_on,
        plan.recurrence,
        session.context.date ?? plan.date ?? plan.starts_on,
      )
    : null;
  const dayLabel = occ?.total ? `Day ${occ.index} of ${occ.total}` : null;

  const finish = () => {
    finishSession(session.id);
    navigate({ to: "/" });
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as "prayers" | "guide")}
      className="flex min-h-screen flex-col bg-background"
    >
      {/* Progress header + the Prayers/Guide tabs freeze together at the top so
          the tabs stay reachable while a long session scrolls underneath. */}
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-lg px-5 pb-3 pt-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={leaveSession}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground"
            >
              <X className="size-4" /> Close
            </button>
            <p className="truncate text-sm font-medium">{session.title}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                aria-label="Write a reflection about this session"
                title="Write a reflection about this session"
              >
                <Link to="/reflections" search={{ link: session.id }}>
                  <NotebookPen className="size-4" />
                </Link>
              </Button>
              <ShareDialog
                payload={buildSharePayload(session, items)}
                allowEditCover
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    aria-label="Share to follow along"
                  >
                    <Share2 className="size-4" />
                  </Button>
                }
              />
              <p className="text-sm text-muted-foreground tabular-nums">
                {progress.done} / {progress.total}
              </p>
            </div>
          </div>
          <Progress value={pct} className="mt-3 h-1" />
        </div>
        <div className="mx-auto w-full max-w-lg px-5 pb-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prayers">Prayers</TabsTrigger>
            <TabsTrigger value="guide">Guide</TabsTrigger>
          </TabsList>
        </div>
      </div>

      {listen ? <ListenPlayer source={listen} /> : null}

      <div className="mx-auto w-full max-w-lg flex-1">
        {/* forceMount keeps both tabs in the DOM so switching preserves scroll
            position and (later) auto-scroll on the Prayers tab. */}
        <TabsContent value="prayers" forceMount className="data-[state=inactive]:hidden">
          <PrayersTab
            title={session.title}
            items={items}
            estMin={estMin}
            dayLabel={dayLabel}
            currentId={currentId}
            active={tab === "prayers"}
            reducedMotion={reducedMotion}
            onToggle={toggleItemDone}
            sessionId={session.id}
            isLectio={isLectio}
            sourceLabel={sourceLabel}
            sourceUrl={sourceUrl}
            passageRef={passageRef}
            passageText={passageText}
            onSetPassage={(ref, text) => setSessionPassage(session.id, ref, text)}
            onSaveReflection={(itemId, text) => saveSessionReflection(session.id, itemId, text)}
            bibleUrl={bibleUrl}
            bibleHome={bibleHome}
          />
        </TabsContent>

        <TabsContent value="guide" forceMount className="data-[state=inactive]:hidden">
          <GuideTab
            items={items}
            estMin={estMin}
            dayLabel={dayLabel}
            currentId={currentId}
            active={tab === "guide"}
            reducedMotion={reducedMotion}
            onToggle={toggleItemDone}
          />
        </TabsContent>
      </div>

      <footer className="sticky bottom-0 border-t border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto w-full max-w-lg px-5 py-4">
          <Button className="h-14 w-full text-base" onClick={finish}>
            {progress.done >= progress.total && progress.total > 0 ? "Finish session" : "Finish"}
          </Button>
          <label className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={keepAwake}
              onChange={(e) => setKeepAwake(e.target.checked)}
            />
            Keep screen awake
          </label>
        </div>
      </footer>
    </Tabs>
  );
}

/**
 * Tab 1 — the session title followed by every prayer written out in order.
 * Each prayer is a bordered card you can tap to mark done; completed cards go
 * gray. Progress is shared with the Guide tab and the header.
 */
function PrayersTab({
  title,
  items,
  estMin,
  dayLabel,
  currentId,
  active,
  reducedMotion,
  onToggle,
  sessionId,
  isLectio,
  sourceLabel,
  sourceUrl,
  passageRef,
  passageText,
  onSetPassage,
  onSaveReflection,
  bibleUrl,
  bibleHome,
}: {
  title: string;
  items: SessionItem[];
  estMin?: number | undefined;
  dayLabel?: string | null | undefined;
  currentId: string | null;
  active: boolean;
  reducedMotion: boolean;
  onToggle: (itemId: string) => void;
  sessionId: string;
  isLectio: boolean;
  sourceLabel: string;
  sourceUrl: string;
  passageRef: string;
  passageText: string;
  onSetPassage: (reference: string, text: string) => void;
  onSaveReflection: (itemId: string, text: string) => void;
  bibleUrl: (ref: string) => string;
  bibleHome: string;
}) {
  const currentRef = useAutoScrollToCurrent<HTMLDivElement>(currentId, active, reducedMotion);
  return (
    <div className="px-5 py-8">
      <h1 className="mb-2 text-center font-display text-3xl leading-tight">{title}</h1>
      {dayLabel ? (
        <p className="mb-1 text-center text-sm font-medium text-primary">{dayLabel}</p>
      ) : null}
      <p className="mb-4 text-center text-xs uppercase tracking-wide text-muted-foreground">
        {items.length} steps · in order{estMin ? ` · ~${estMin} min` : ""}
      </p>
      <p className="mb-2 text-center text-xs text-muted-foreground">
        {isLectio
          ? "Read slowly. Write your response at each movement."
          : "Tap a prayer when you finish it."}
      </p>
      {isLectio && sourceLabel ? (
        <p className="mb-8 text-center text-xs text-muted-foreground">
          Source:{" "}
          {sourceUrl ? (
            <ExtLink href={sourceUrl} className="underline hover:text-foreground">
              {sourceLabel}
            </ExtLink>
          ) : (
            sourceLabel
          )}
        </p>
      ) : null}
      {isLectio ? (
        <PassageEditor
          passageRef={passageRef}
          passageText={passageText}
          onSetPassage={onSetPassage}
          bibleUrl={bibleUrl}
          bibleHome={bibleHome}
        />
      ) : null}
      <div className="space-y-5">
        {items.map((item) => {
          const done = item.completion_status === "complete";
          const current = item.id === currentId;

          // A journaling step is written into, not tapped done — it gets its own
          // card with an inline field, so tapping the body never toggles it.
          if (item.kind === "reflection") {
            return (
              <ReflectionCard
                key={item.id}
                item={item}
                current={current}
                cardRef={current ? currentRef : undefined}
                onSave={(text) => onSaveReflection(item.id, text)}
              />
            );
          }

          return (
            <div
              key={item.id}
              ref={current ? currentRef : undefined}
              role="button"
              tabIndex={0}
              aria-pressed={done}
              aria-current={current ? "step" : undefined}
              onClick={() => onToggle(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(item.id);
                }
              }}
              className={cn(
                "relative cursor-pointer rounded-2xl border px-5 py-6 transition",
                done
                  ? "border-border/60 bg-muted/40 opacity-60"
                  : current
                    ? "border-primary bg-card shadow-sm ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40",
              )}
            >
              {current ? (
                <span className="absolute left-4 top-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Now
                </span>
              ) : null}
              <ItemView item={item} showMeditation />
              {item.kind === "scripture" && item.reference ? (
                <div className="mt-5 flex justify-center">
                  <ExtLink
                    href={bibleUrl(item.reference)}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
                  >
                    <BookOpen className="size-3.5" /> Open in your Bible
                  </ExtLink>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {/* sessionId reserved for future per-session journaling analytics */}
      <span className="hidden" data-session={sessionId} />
    </div>
  );
}

/**
 * The passage the whole Lectio sitting reads — chosen up front, re-read in each
 * of the first three movements. Open your Bible to read and be inspired (a psalm,
 * a gospel story, or the day's reading), then enter the reference; optionally
 * paste the passage text so it shows with each movement. Setting it rewrites every
 * scripture step's reference (and body) for this session, keeping the readings in sync.
 */
function PassageEditor({
  passageRef,
  passageText,
  onSetPassage,
  bibleUrl,
  bibleHome,
}: {
  passageRef: string;
  passageText: string;
  onSetPassage: (reference: string, text: string) => void;
  bibleUrl: (ref: string) => string;
  bibleHome: string;
}) {
  const isSet = Boolean(passageRef.trim() || passageText.trim());
  const [open, setOpen] = useState(!isSet);
  const [ref, setRef] = useState(passageRef);
  const [text, setText] = useState(passageText);
  const [showPaste, setShowPaste] = useState(Boolean(passageText.trim()));
  useEffect(() => {
    setRef(passageRef);
    setText(passageText);
    setShowPaste(Boolean(passageText.trim()));
    setOpen(!(passageRef.trim() || passageText.trim()));
  }, [passageRef, passageText]);

  const openUrl = ref.trim() ? bibleUrl(ref.trim()) : bibleHome;
  const save = () => {
    onSetPassage(ref.trim(), text.trim());
    if (ref.trim() || text.trim()) setOpen(false);
  };

  return (
    <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          Your passage
        </p>
        {!open ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            <Pencil className="mr-1.5 size-3.5" /> Change
          </Button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-muted-foreground">
            Choose a brief passage — a psalm, a gospel story, or today&rsquo;s reading. Open your
            Bible to read and be inspired, then enter it here. The first three movements re-read it.
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Reference — e.g. Psalm 23 or John 15:1-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
            />
            {openUrl ? (
              <ExtLink
                href={openUrl}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
              >
                <BookOpen className="size-3.5" /> Open your Bible
              </ExtLink>
            ) : null}
          </div>
          {showPaste ? (
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the passage text here (optional) — it will show with each movement."
              rows={4}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowPaste(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Paste the passage text
            </button>
          )}
          <div className="flex justify-end">
            <Button size="sm" onClick={save} disabled={!ref.trim() && !text.trim()}>
              Set passage
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1">
          <p className="font-display text-xl">{passageRef || "Passage set"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {passageText.trim()
              ? "Passage text added — shown with each movement."
              : "The first three movements re-read it."}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * A Lectio journaling step: the prompt, an inline written response, and a Save
 * that records it as a linked Reflection (and marks the step done). Editing an
 * already-saved response and clearing it re-opens the step.
 */
function ReflectionCard({
  item,
  current,
  cardRef,
  onSave,
}: {
  item: SessionItem;
  current: boolean;
  cardRef?: React.Ref<HTMLDivElement> | undefined;
  onSave: (text: string) => void;
}) {
  const saved = (item.configuration as { response?: string } | undefined)?.response ?? "";
  const [text, setText] = useState(saved);
  useEffect(() => setText(saved), [saved]);
  const done = item.completion_status === "complete";
  const dirty = text.trim() !== saved.trim();

  return (
    <div
      ref={cardRef}
      aria-current={current ? "step" : undefined}
      className={cn(
        "relative rounded-2xl border px-5 py-6 transition",
        done
          ? "border-border/60 bg-muted/30"
          : current
            ? "border-primary bg-card shadow-sm ring-2 ring-primary/30"
            : "border-border bg-card",
      )}
    >
      {current && !done ? (
        <span className="absolute left-4 top-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Now
        </span>
      ) : null}
      {done ? (
        <span className="absolute right-4 top-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <Check className="size-3" /> Saved
        </span>
      ) : null}
      <p className="eyebrow text-center">{item.title}</p>
      {item.body?.trim() ? (
        <p className="prayer-text mt-4 text-center text-muted-foreground">{item.body}</p>
      ) : null}
      <RichTextArea
        value={text}
        onChange={setText}
        placeholder="Write in your own words…"
        rows={4}
        className="mt-5"
        ariaLabel={item.title}
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        {saved && !text.trim() ? (
          <span className="mr-auto text-xs text-muted-foreground">Clearing re-opens this step</span>
        ) : null}
        <Button size="sm" onClick={() => onSave(text)} disabled={!dirty}>
          {text.trim() ? "Save" : done ? "Clear" : "Save"}
        </Button>
      </div>
    </div>
  );
}

/** Short label for a step on the Guide — e.g. "Hail Mary (1/10)". */
function mapLabel(item: SessionItem): string {
  const base = item.kind === "scripture" ? (item.reference ?? "Scripture") : item.title;
  return item.repetition_total
    ? `${base} (${item.repetition_index}/${item.repetition_total})`
    : base;
}

/**
 * Tab 2 — a summarized guide to the whole session, one line per step with a
 * check circle. Each line can expand to reveal the step's full text: tapping the
 * check circle marks the step done, tapping the rest of the row toggles that
 * line open/closed. An expansion mode drives which lines auto-open as you pray
 * (follow the current step, trail the ones you've finished, all, or none); a
 * manual tap overrides the mode for that line until the mode changes.
 */
function GuideTab({
  items,
  estMin,
  dayLabel,
  currentId,
  active,
  reducedMotion,
  onToggle,
}: {
  items: SessionItem[];
  estMin?: number | undefined;
  dayLabel?: string | null | undefined;
  currentId: string | null;
  active: boolean;
  reducedMotion: boolean;
  onToggle: (itemId: string) => void;
}) {
  const currentRef = useAutoScrollToCurrent<HTMLLIElement>(currentId, active, reducedMotion);
  const [mode, setMode] = useState<GuideExpandMode>(GUIDE_EXPAND_DEFAULT);
  // Per-step manual open/close that wins over the mode. Cleared when the mode
  // changes so the freshly-picked mode drives every step again.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const changeMode = (next: GuideExpandMode) => {
    setMode(next);
    setOverrides({});
  };
  const toggleStep = (item: SessionItem) =>
    setOverrides((o) => ({
      ...o,
      [item.id]: !isStepExpanded(mode, item, currentId, o),
    }));

  return (
    <div className="px-5 py-6">
      {dayLabel ? <p className="mb-1 text-sm font-medium text-primary">{dayLabel}</p> : null}
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
        {items.length} steps{estMin ? ` · ~${estMin} min` : ""}
      </p>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Tap the circle to mark done; tap a line to open it. Progress is shared with the Prayers
          tab.
        </p>
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only">Expand</span>
          <select
            value={mode}
            onChange={(e) => changeMode(e.target.value as GuideExpandMode)}
            aria-label="Which steps to expand"
            className="h-8 rounded-md border border-input bg-card px-2 text-xs"
          >
            {GUIDE_EXPAND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ol className="space-y-1">
        {items.map((item, i) => {
          const heading =
            item.kind === "mystery"
              ? ((item.configuration as { heading?: string } | undefined)?.heading ??
                `${ordinalWord(item.mystery_ordinal ?? 1)} Mystery`)
              : undefined;
          const done = item.completion_status === "complete";
          const current = item.id === currentId;
          const expanded = isStepExpanded(mode, item, currentId, overrides);
          return (
            <li key={item.id} ref={current ? currentRef : undefined}>
              {heading ? (
                <p className="mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {heading}
                </p>
              ) : null}
              <div
                className={cn(
                  "rounded-xl transition",
                  current ? "bg-primary/10 ring-1 ring-primary/30" : "",
                )}
              >
                <div className="flex w-full items-center gap-3 px-2 py-2 text-left">
                  <button
                    type="button"
                    onClick={() => onToggle(item.id)}
                    aria-pressed={done}
                    aria-label={
                      done ? `Mark "${mapLabel(item)}" not done` : `Mark "${mapLabel(item)}" done`
                    }
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : current
                          ? "border-primary bg-background"
                          : "border-border bg-background hover:border-primary",
                    )}
                  >
                    {done ? <Check className="size-4" /> : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStep(item)}
                    aria-expanded={expanded}
                    aria-current={current ? "step" : undefined}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left"
                  >
                    <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm",
                        done
                          ? "text-muted-foreground line-through"
                          : current
                            ? "font-semibold text-primary"
                            : "font-medium",
                      )}
                    >
                      {mapLabel(item)}
                    </span>
                    {expanded ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {expanded ? (
                  <div className="border-t border-border/60 px-4 pb-4 pt-3">
                    <ItemView item={item} showMeditation />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Convert a YouTube watch / share / shorts URL to its embed URL, else null. */
function youTubeEmbed(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/) ?? null;
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

/**
 * Basic listen player for the session's chosen source. Audio → native <audio>;
 * video → YouTube embed when recognized, otherwise native <video>. No
 * autoscroll/timing yet — the user advances items themselves.
 */
function ListenPlayer({ source }: { source: ListenSource }) {
  const embed = source.kind === "video" ? youTubeEmbed(source.url) : null;
  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-3">
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{source.label}</p>
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={embed}
              title={source.label}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : source.kind === "video" ? (
          <video src={source.url} controls className="w-full rounded-lg" />
        ) : (
          <audio src={source.url} controls className="w-full" />
        )}
      </div>
    </div>
  );
}
