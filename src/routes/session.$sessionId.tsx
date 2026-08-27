import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
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
      { title: "Prayer Mode — Faith Journey" },
      {
        name: "description",
        content:
          "A distraction-free follow-along prayer session: every prayer, in order, with your place kept.",
      },
      { property: "og:title", content: "Prayer Mode — Faith Journey" },
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
  const { db, ready, toggleItemDone, finishSession } = useApp();
  const navigate = useNavigate();

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

  const listen = session.context.listen_source;
  const progress = sessionProgress(items);
  const pct = progress.total ? (progress.done / progress.total) * 100 : 0;
  const estMin = estimateMinutes(items);

  // "Day 3 of 9" for a bounded recurrence, derived from the plan's series.
  const plan = session.plan_id ? db.session_plans.find((p) => p.id === session.plan_id) : undefined;
  const occ = plan
    ? occurrenceInfo(
        plan.starts_on,
        plan.recurrence,
        plan.date ?? plan.starts_on ?? session.context.date,
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
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <X className="size-4" /> Close
            </Link>
            <p className="truncate text-sm font-medium">{session.title}</p>
            <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
              {progress.done} / {progress.total}
            </p>
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
}: {
  title: string;
  items: SessionItem[];
  estMin?: number | undefined;
  dayLabel?: string | null | undefined;
  currentId: string | null;
  active: boolean;
  reducedMotion: boolean;
  onToggle: (itemId: string) => void;
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
      <p className="mb-8 text-center text-xs text-muted-foreground">
        Tap a prayer when you finish it.
      </p>
      <div className="space-y-5">
        {items.map((item) => {
          const done = item.completion_status === "complete";
          const current = item.id === currentId;
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
            </div>
          );
        })}
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

function decadeOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] ?? s[v] ?? "th";
  return `${n}${suffix} decade`;
}

function DecadeTag({ decade }: { decade: number | undefined }) {
  if (!decade) return null;
  return <p className="text-right text-sm font-medium text-primary">{decadeOrdinal(decade)}</p>;
}

function ItemView({ item, showMeditation }: { item: SessionItem; showMeditation: boolean }) {
  const decade = (item.configuration as { decade?: number } | undefined)?.decade;
  if (item.kind === "mystery") {
    const config = (item.configuration ?? {}) as {
      heading?: string;
      presentation?: string;
      fruit?: string;
      scripture_text?: string;
    };
    // Reveal the text unless we're waiting for the tap in "choose during session".
    const showText = config.presentation !== "choose_during_session" || showMeditation;
    return (
      <div className="text-center">
        <DecadeTag decade={decade} />
        <p className="eyebrow">
          {config.heading ?? `${ordinalWord(item.mystery_ordinal ?? 1)} Mystery`}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight">{item.title}</h2>
        {showText && config.scripture_text ? (
          <>
            <p className="prayer-text mt-6 text-left text-[1.25rem] text-muted-foreground">
              {config.scripture_text}
            </p>
            {item.reference ? (
              <p className="mt-2 text-right text-sm italic text-muted-foreground">
                — {item.reference}
              </p>
            ) : null}
          </>
        ) : null}
        {showText && item.body ? (
          <p className="prayer-text mt-4 text-left text-[1.25rem] text-muted-foreground">
            {item.body}
          </p>
        ) : null}
        {config.fruit ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Fruit of the mystery:</span>{" "}
            {config.fruit}
          </p>
        ) : null}
      </div>
    );
  }

  if (item.kind === "intention" || item.kind === "petition" || item.kind === "meditation") {
    const eyebrow =
      item.kind === "petition"
        ? "Petition"
        : item.kind === "meditation"
          ? "Meditation"
          : "Intention";
    return (
      <div className="text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl">{item.title}</h2>
        {item.body ? <p className="prayer-text mt-4 text-left">{item.body}</p> : null}
      </div>
    );
  }

  if (item.kind === "scripture") {
    return (
      <div>
        {item.reference ? (
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary">
            {item.reference}
          </p>
        ) : (
          <p className="eyebrow text-center">Scripture</p>
        )}
        <p className="prayer-text mt-6 text-[1.35rem] leading-relaxed">{item.body}</p>
      </div>
    );
  }

  if (item.kind === "external_link") {
    const config = (item.configuration ?? {}) as {
      external_options?: { label: string; url: string; is_default?: boolean }[];
    };
    const options = config.external_options ?? [];
    return (
      <div className="text-center">
        <p className="eyebrow">Pray along</p>
        <h2 className="mt-3 font-display text-3xl leading-tight">{item.title}</h2>
        {item.body ? <p className="prayer-text mt-4 text-muted-foreground">{item.body}</p> : null}
        <div className="mt-8 space-y-3 text-left">
          {options.map((o) => (
            <ExtLink
              key={o.url}
              href={o.url}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium transition hover:border-primary"
            >
              <span className="pr-3">{o.label}</span>
              {o.is_default ? (
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  Default
                </span>
              ) : null}
            </ExtLink>
          ))}
        </div>
      </div>
    );
  }

  if (item.kind === "song") {
    const labels =
      (item.configuration as { segment_labels?: string[] } | undefined)?.segment_labels ?? [];
    return (
      <div>
        <DecadeTag decade={decade} />
        <p className="eyebrow text-center">
          {labels.length ? `Song · ${labels.join(" · ")}` : "Song"}
        </p>
        <h2 className="mt-2 text-center font-display text-3xl leading-tight">{item.title}</h2>
        <p className="prayer-text mt-8">{item.body}</p>
      </div>
    );
  }

  return (
    <div>
      <DecadeTag decade={decade} />
      <h2 className="text-center font-display text-3xl leading-tight">{item.title}</h2>
      {item.repetition_total ? (
        <p className="mt-2 text-center text-base tracking-wide text-muted-foreground tabular-nums">
          {item.repetition_index} of {item.repetition_total}
        </p>
      ) : null}
      <p className="prayer-text mt-8">{item.body}</p>
    </div>
  );
}
