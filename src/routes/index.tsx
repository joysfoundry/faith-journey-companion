import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  ChevronRight,
  MoreVertical,
  NotebookPen,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";

import { PrayerSearch } from "@/components/home/PrayerSearch";
import { WordSection } from "@/components/home/WordSection";
import { ReflectionComposer } from "@/components/home/ReflectionComposer";
import { SectionCard, SectionRow } from "@/components/home/SectionCard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { readingPrograms, todaysWord, type LinkableItem } from "@/domain/placeholderData";
import { defaultContext, resolveMysterySet, todayISO } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { PrayerTemplate } from "@/lib/prayer/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faith Journey — Your daily prayer companion" },
      {
        name: "description",
        content:
          "Devotion, need, word, and learning in one calm daily companion — with reflections that connect them.",
      },
      { property: "og:title", content: "Faith Journey — Your daily prayer companion" },
      {
        property: "og:description",
        content: "Devotion, need, word, and learning in one calm daily companion.",
      },
    ],
  }),
  component: Index,
});

const CONTENT_TYPE_LABELS: Record<string, string> = {
  book: "Book",
  article: "Article",
  newsletter: "Newsletter",
  video: "Video",
  sermon: "Sermon",
  podcast: "Podcast",
  show: "Show",
  other: "Other",
};

/** Icon-only header action. Label is for a11y + tooltip; no visible text. */
function IconAction({
  label,
  onClick,
  children,
  asChild = false,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  asChild?: boolean;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-8 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label={label}
      title={label}
      asChild={asChild}
    >
      {children}
    </Button>
  );
}

/** Pick which devotion the Home "daily" card starts. Persisted in settings. */
function ChangeDevotionDialog({
  open,
  onOpenChange,
  templates,
  currentId,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templates: PrayerTemplate[];
  currentId: string | undefined;
  onChoose: (id: string | undefined) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">Daily devotion</DialogTitle>
          <DialogDescription>Choose the devotion your daily prayer starts from.</DialogDescription>
        </DialogHeader>
        <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto">
          <li>
            <button
              type="button"
              onClick={() => {
                onChoose(undefined);
                onOpenChange(false);
              }}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-medium">Standard Holy Rosary</span>
                <span className="block text-xs text-muted-foreground">App default</span>
              </span>
              {currentId === undefined ? (
                <Check className="size-4 text-primary" aria-hidden />
              ) : null}
            </button>
          </li>
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onChoose(t.id);
                  onOpenChange(false);
                }}
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{t.name}</span>
                  {t.description ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {t.description}
                    </span>
                  ) : null}
                </span>
                {currentId === t.id ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function Index() {
  const { db, startSession, startBuiltSession, setDailyTemplate } = useApp();
  const navigate = useNavigate();
  const today = todayISO();
  const [journalLinkId, setJournalLinkId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const setId = resolveMysterySet(db, defaultContext({ date: today }));
  const setName = db.mystery_sets.find((s) => s.id === setId)?.name ?? "Mysteries";

  const dailyId = db.settings?.daily_template_id;
  const daily =
    (dailyId ? db.templates.find((t) => t.id === dailyId) : undefined) ??
    db.templates.find((t) => t.id === "tpl-rosary") ??
    db.templates[0];
  const isRosary = (daily?.mystery_count ?? 0) > 0;
  // The daily row shows the chosen devotion (with the day's mysteries when it's a rosary).
  const dailySubtitle = isRosary
    ? `${daily?.name ?? "Rosary"} · ${setName}`
    : (daily?.name ?? "Prayer");

  const openSessions = db.sessions.filter((s) => !s.completed_at);
  const completedSessions = db.sessions.filter((s) => s.completed_at);
  const isToday = (iso?: string) => (iso ?? "").slice(0, 10) === today;
  const latestDoneToday = (match: (s: (typeof completedSessions)[number]) => boolean) =>
    completedSessions
      .filter((s) => isToday(s.completed_at) && match(s))
      .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))[0];

  // The daily's own ad-hoc session (started from the Daily row, no plan). The
  // Daily row itself reflects its state, so it never shows as a separate row.
  const dailyOpen = daily
    ? openSessions.find((s) => s.template_id === daily.id && !s.plan_id)
    : undefined;
  const dailyDone =
    daily && !dailyOpen
      ? latestDoneToday((s) => s.template_id === daily.id && !s.plan_id)
      : undefined;

  // Each today session resolves to ONE state — start (Today), continue, or done —
  // never doubled. Completed sessions stay visible as "Done" for the day, deduped
  // to one per devotion (the daily is shown on its own row).
  const representedIds = new Set<string>();
  const doneSeen = new Set<string>(daily ? [daily.id] : []);
  const continueList: { id: string; title: string; sessionId: string }[] = [];
  const todayList: { id: string; title: string; planId: string }[] = [];
  const doneList: { id: string; title: string; sessionId: string }[] = [];
  const addDone = (key: string, row: { id: string; title: string; sessionId: string }) => {
    if (doneSeen.has(key)) return;
    doneSeen.add(key);
    doneList.push(row);
  };
  for (const plan of db.session_plans.filter((p) => p.date === today)) {
    const tpl = db.templates.find((t) => t.id === plan.template_id);
    const title = plan.purpose || tpl?.name || "Session";
    const openS = openSessions.find((s) => s.plan_id === plan.id);
    const doneS = latestDoneToday((s) => s.plan_id === plan.id);
    if (openS) {
      representedIds.add(openS.id);
      continueList.push({ id: plan.id, title, sessionId: openS.id });
    } else if (doneS) {
      addDone(plan.template_id || plan.id, { id: plan.id, title, sessionId: doneS.id });
    } else {
      todayList.push({ id: plan.id, title, planId: plan.id });
    }
  }
  // Other in-progress sessions (not the daily, not a today-plan already listed).
  for (const s of openSessions) {
    if (s.id === dailyOpen?.id || representedIds.has(s.id)) continue;
    continueList.push({ id: s.id, title: s.title, sessionId: s.id });
  }
  // Ad-hoc sessions completed today (no plan), one per devotion.
  for (const s of completedSessions) {
    if (!isToday(s.completed_at) || s.plan_id) continue;
    addDone(s.template_id || s.id, { id: s.id, title: s.title, sessionId: s.id });
  }

  function openJournal(linkId: string) {
    setJournalLinkId(linkId);
    document.getElementById("reflection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function beginDaily() {
    if (!daily) return;
    // Resume the in-progress daily session rather than starting a duplicate.
    if (dailyOpen) {
      navigate({ to: "/session/$sessionId", params: { sessionId: dailyOpen.id } });
      return;
    }
    const session = startSession(daily.id, { date: today, progress_mode: "scroll" });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  }

  function beginPlan(planId: string) {
    const plan = db.session_plans.find((p) => p.id === planId);
    if (!plan) return;
    const items =
      plan.items ??
      db.template_items
        .filter((t) => t.template_id === plan.template_id)
        .sort((a, b) => a.position - b.position);
    const tpl = db.templates.find((t) => t.id === plan.template_id);
    const session = startBuiltSession(
      plan.template_id || null,
      items,
      { date: today, ...plan.context },
      plan.purpose || tpl?.name,
      plan.id,
    );
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  }

  const linkables: LinkableItem[] = [
    { id: daily?.id ?? "rosary", label: dailySubtitle, group: "Prayer & devotion" },
    { id: todaysWord.id, label: "Daily Readings", group: "Word" },
    ...readingPrograms.map((p) => ({ id: p.id, label: p.title, group: "Word" })),
    ...db.learning_items.map((l) => ({ id: l.id, label: l.title, group: "Learn" })),
  ];

  const activeLearning = db.learning_items.filter((i) => i.status !== "finished");

  return (
    <AppShell>
      <div className="space-y-5">
        {/* A — Prayer & Devotion: header search, today's rosary, today's sessions */}
        <Card className="overflow-hidden border-border/70">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
              Prayer & Devotion
            </h2>
            <div className="-my-1 flex shrink-0 items-center gap-0.5">
              <Button
                size="icon"
                variant="ghost"
                className={`size-8 ${searchOpen ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                aria-label="Search prayers"
                aria-pressed={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
              >
                <Search className="size-4" aria-hidden />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    aria-label="Devotion options"
                  >
                    <MoreVertical className="size-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate({ to: "/pray" })}>
                    <Plus className="size-4" aria-hidden /> New session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {searchOpen ? (
            <div className="border-b border-border/60 px-5 py-3">
              <PrayerSearch />
            </div>
          ) : null}

          <div>
            {/* Daily rosary — auto-provided (not user-created), so it gets a
                subtle accent and a "Daily" tag, plus a switch icon to swap the
                template it uses. Otherwise it's a session row like the rest. */}
            <div className="flex items-center justify-between gap-3 bg-primary/[0.04] px-5 py-4">
              <span className="min-w-0">
                <span className="eyebrow block text-primary">
                  {dailyOpen ? "Daily · Continue" : dailyDone ? "Daily · Done" : "Daily"}
                </span>
                <span className="block truncate font-display text-lg">{dailySubtitle}</span>
              </span>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconAction
                  label="Write a reflection about today's rosary"
                  onClick={() => openJournal(daily?.id ?? "rosary")}
                >
                  <span>
                    <NotebookPen className="size-4" aria-hidden />
                  </span>
                </IconAction>
                <IconAction
                  label="Change the daily rosary template"
                  onClick={() => setPickerOpen(true)}
                >
                  <span>
                    <ArrowLeftRight className="size-4" aria-hidden />
                  </span>
                </IconAction>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 text-primary"
                  onClick={beginDaily}
                  aria-label={
                    dailyOpen
                      ? "Continue the daily rosary"
                      : dailyDone
                        ? "Pray the daily rosary again"
                        : "Begin the daily rosary"
                  }
                  title={
                    dailyOpen
                      ? "Continue the daily rosary"
                      : dailyDone
                        ? "Pray again"
                        : "Begin the daily rosary"
                  }
                >
                  <Play className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            {/* In-progress sessions to continue (never doubled with a Today row) */}
            {continueList.map((row) => (
              <Link
                key={row.id}
                to="/session/$sessionId"
                params={{ sessionId: row.sessionId }}
                className="flex items-center justify-between border-t border-border/60 px-5 py-4 transition-colors hover:bg-accent/40"
              >
                <span className="min-w-0">
                  <span className="eyebrow block">Continue</span>
                  <span className="truncate font-display text-lg">{row.title}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}

            {/* Sessions scheduled for today, not yet started */}
            {todayList.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4"
              >
                <span className="min-w-0">
                  <span className="eyebrow block">Today</span>
                  <span className="truncate font-display text-lg">{row.title}</span>
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 text-primary"
                  onClick={() => beginPlan(row.planId)}
                  aria-label={`Begin ${row.title}`}
                  title={`Begin ${row.title}`}
                >
                  <Play className="size-4" aria-hidden />
                </Button>
              </div>
            ))}

            {/* Completed today — kept visible as Done; tap to review. */}
            {doneList.map((row) => (
              <Link
                key={row.id}
                to="/session/$sessionId"
                params={{ sessionId: row.sessionId }}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4 transition-colors hover:bg-accent/40"
              >
                <span className="min-w-0">
                  <span className="eyebrow block text-muted-foreground">Done</span>
                  <span className="truncate font-display text-lg text-muted-foreground">
                    {row.title}
                  </span>
                </span>
                <Check className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </div>
        </Card>

        {/* C — Word */}
        <SectionCard
          title="Word"
          actions={
            <IconAction label="Open the full Word page" asChild>
              <Link to="/word">
                <BookOpen className="size-4" aria-hidden />
              </Link>
            </IconAction>
          }
        >
          <WordSection onReflect={openJournal} />
        </SectionCard>

        {/* D — Learn (collection: Life Library) */}
        <SectionCard
          title="Learn"
          actions={
            <>
              <IconAction label="All & finished items" asChild>
                <Link to="/formation">
                  <BookOpen className="size-4" aria-hidden />
                </Link>
              </IconAction>
              <IconAction label="Add an item" asChild>
                <Link to="/formation" search={{ add: true }}>
                  <Plus className="size-4" aria-hidden />
                </Link>
              </IconAction>
            </>
          }
        >
          {activeLearning.length === 0 ? (
            <SectionRow className="border-t border-border/60">
              <p className="text-sm text-muted-foreground">
                Books, articles, videos, sermons, shows you&apos;re following.
              </p>
            </SectionRow>
          ) : (
            activeLearning.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4"
              >
                <Link
                  to="/formation"
                  className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-primary"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}
                      {item.creator ? ` · ${item.creator}` : ""}
                      {item.source ? ` · ${item.source}` : ""}
                    </span>
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconAction
                    label={`Write a reflection about ${item.title}`}
                    onClick={() => openJournal(item.id)}
                  >
                    <span>
                      <NotebookPen className="size-4" aria-hidden />
                    </span>
                  </IconAction>
                  <Link
                    to="/formation"
                    aria-label={`Open ${item.title} in Learn`}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            ))
          )}
        </SectionCard>

        {/* Reflection / Journal — composer only; saved entries live on /reflections */}
        <div id="reflection">
          <SectionCard
            title="Reflection"
            actions={
              <IconAction label="Open your journal" asChild>
                <Link to="/reflections">
                  <BookOpen className="size-4" aria-hidden />
                </Link>
              </IconAction>
            }
          >
            <ReflectionComposer linkables={linkables} prefillLinkId={journalLinkId} />
          </SectionCard>
        </div>
      </div>

      <ChangeDevotionDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        templates={db.templates}
        currentId={dailyId}
        onChoose={setDailyTemplate}
      />
    </AppShell>
  );
}
