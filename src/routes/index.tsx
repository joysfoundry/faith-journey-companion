import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Notebook,
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
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
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
import { todaysWord, type LinkableItem } from "@/domain/placeholderData";
import {
  LINK_PLATFORM_LABELS,
  SECTION_LABEL,
  pinnedLinks,
  type PinnedLink,
} from "@/lib/prayer/knowledge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { defaultContext, planTitle, resolveMysterySet, todayISO } from "@/lib/prayer/compiler";
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

/**
 * One pinned link on Home — a favorited Voice channel or Content link. Opens the
 * link out; a chevron leads to the owning record (a Voice or a Content page).
 */
function PinnedLinkRow({ pin }: { pin: PinnedLink }) {
  return (
    <SectionRow className="border-t border-border/60 pl-6">
      <div className="flex items-center justify-between gap-3">
        <ExtLink
          href={pin.url}
          className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-primary"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">
              {pin.ownerName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {pin.label || LINK_PLATFORM_LABELS[pin.platform]}
            </span>
          </span>
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </ExtLink>
        {pin.ownerType === "voice" ? (
          <Link
            to="/voice/$voiceId"
            params={{ voiceId: pin.ownerId }}
            aria-label={`Open ${pin.ownerName}`}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link
            to="/knowledge/$knowledgeId"
            params={{ knowledgeId: pin.ownerId }}
            aria-label={`Open ${pin.ownerName}`}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </SectionRow>
  );
}

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
    const title = planTitle(db, plan);
    const openS = openSessions.find((s) => s.plan_id === plan.id);
    if (openS) {
      representedIds.add(openS.id);
      continueList.push({ id: plan.id, title, sessionId: openS.id });
    } else if (latestDoneToday((s) => s.plan_id === plan.id)) {
      // Completed today — surfaced as Done by the completed-sessions pass below.
      // (Kept out of Today so a finished once-plan doesn't reappear as "start".)
    } else {
      todayList.push({ id: plan.id, title, planId: plan.id });
    }
  }
  // Other in-progress sessions (not the daily, not a today-plan already listed).
  for (const s of openSessions) {
    if (s.id === dailyOpen?.id || representedIds.has(s.id)) continue;
    continueList.push({ id: s.id, title: s.title, sessionId: s.id });
  }
  // Everything completed today lands in Done — one per devotion. This includes
  // recurring-plan sessions whose plan has already rolled forward to its next
  // date (so the today-plan loop above no longer sees them). The daily shows on
  // its own row, so it's excluded via doneSeen.
  for (const s of completedSessions) {
    if (!isToday(s.completed_at)) continue;
    const plan = s.plan_id ? db.session_plans.find((p) => p.id === s.plan_id) : undefined;
    const title = plan ? planTitle(db, plan) : s.title?.trim() || "Prayer session";
    addDone(plan?.template_id || s.template_id || s.id, { id: s.id, title, sessionId: s.id });
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
    ...db.knowledge_items.map((k) => ({ id: k.id, label: k.title, group: "Knowledge" })),
  ];

  // Home Knowledge card: the links you've pinned — favorited Voice channels and
  // Content links. Curated by the star, not auto-surfaced.
  const homePins = pinnedLinks(db.voices, db.knowledge_items);

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
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/pray", search: { build: true } })}
                  >
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
            {/* Daily rosary — auto-provided (not user-created). The blue eyebrow
                (text-primary) differentiates it; no background tint. A switch
                icon swaps the template it uses. Otherwise a normal session row. */}
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="min-w-0">
                <span className="eyebrow block text-primary">
                  {dailyOpen
                    ? "Daily Rosary · Continue"
                    : dailyDone
                      ? "Daily Rosary · Done"
                      : "Daily Rosary"}
                </span>
                <span className="block truncate font-display text-base">{dailySubtitle}</span>
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
                className="flex items-center justify-between border-t border-border/60 px-5 py-3 transition-colors hover:bg-accent/40"
              >
                <span className="min-w-0">
                  <span className="eyebrow block">Continue</span>
                  <span className="truncate font-display text-base">{row.title}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}

            {/* Sessions scheduled for today, not yet started */}
            {todayList.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="eyebrow block">Today</span>
                  <span className="truncate font-display text-base">{row.title}</span>
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
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3 transition-colors hover:bg-accent/40"
              >
                <span className="min-w-0">
                  <span className="eyebrow block text-muted-foreground">Done</span>
                  <span className="truncate font-display text-base text-muted-foreground">
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

        {/* D — Vessels: pinned channels & links from the vessels you follow */}
        <SectionCard
          title={SECTION_LABEL}
          actions={
            <IconAction label="Add & browse your library" asChild>
              <Link to="/formation" search={{ add: true }}>
                <Plus className="size-4" aria-hidden />
              </Link>
            </IconAction>
          }
        >
          {homePins.length === 0 ? (
            <SectionRow className="border-t border-border/60">
              <p className="text-sm text-muted-foreground">
                Star a channel or link in your library to pin it here.
              </p>
            </SectionRow>
          ) : (
            homePins.map((pin) => <PinnedLinkRow key={`${pin.ownerId}-${pin.url}`} pin={pin} />)
          )}
        </SectionCard>

        {/* Reflection / Journal — composer only; saved entries live on /reflections */}
        <div id="reflection">
          <SectionCard
            title="Reflection"
            actions={
              <IconAction label="Open your journal" asChild>
                <Link to="/reflections">
                  <Notebook className="size-4" aria-hidden />
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
