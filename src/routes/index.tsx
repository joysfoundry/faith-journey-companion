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
import { useEffect, useState } from "react";

import { PrayerSearch } from "@/components/home/PrayerSearch";
import { OnlineBibleLink, WordSection } from "@/components/home/WordSection";
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
import { type LinkableItem } from "@/domain/placeholderData";
import { getLiturgicalDay, type LiturgicalDay } from "@/lib/liturgical/calendar";
import { buildReflectionLinkables } from "@/lib/prayer/linkables";
import {
  CATEGORY_LABELS,
  LINK_PLATFORM_LABELS,
  SECTION_LABEL_LONG,
  hasStatus,
  nextStatus,
  pinnedLinks,
  statusLabel,
  type PinnedLink,
} from "@/lib/prayer/knowledge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PLATFORM_ICON } from "@/components/knowledge/platform-icon";
import {
  activeDailyRosaryFulfiller,
  defaultContext,
  nextOccurrence,
  occurrenceInfo,
  planTitle,
  resolveMysterySet,
  todayISO,
} from "@/lib/prayer/compiler";
import {
  PRAYER_APPS,
  dailyRosaryAppLabel,
  effectivePrayerAppId,
  isExternalDailyRosary,
  resolveDailyRosaryUrl,
} from "@/lib/prayer/apps";
import { useApp } from "@/lib/prayer/store";
import { dayOf } from "@/lib/prayer/journeyExport";
import type { KnowledgeStatus, PrayerTemplate, SessionPlan } from "@/lib/prayer/types";

// A short "Tue, Sep 15" label. Parses a bare yyyy-mm-dd at local midnight so it
// never shifts a day backward in negative-offset zones (ACTS-192).
function dayShort(dateISO: string): string {
  return new Date(`${dateISO}T00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oravia — Your daily prayer companion" },
      {
        name: "description",
        content:
          "Devotion, need, word, and learning in one daily companion — with reflections that connect them.",
      },
      // The share headline (ACTS-158). This is the URL people actually send, and this
      // override — not the root's — is what a scraper prints in bold under the card,
      // so it carries the brand tagline rather than a second, competing description.
      { property: "og:title", content: "Oravia — Your devotional life, gathered" },
      { name: "twitter:title", content: "Oravia — Your devotional life, gathered" },
      // Deliberately NO og:description here — the root's blurb carries the "free beta,
      // no account needed, entries stay on your device" line, which is the point of the
      // card. Overriding it locally used to silently drop that from every share of "/".
    ],
  }),
  component: Index,
});

/** Per-browser memory of whether the Home Vessels card is expanded (ACTS-182). */
const VESSELS_OPEN_KEY = "oravia:home:vessels-open";

/** Per-browser memory of whether the Home "Upcoming" list is expanded (ACTS-192). */
const UPCOMING_OPEN_KEY = "oravia:home:upcoming-open";

/** A row on the Home Vessels card: either a single content pin, or a Vessel with
 *  its pinned channels grouped onto one row (ACTS-178). */
type HomePinRow =
  | { kind: "content"; pin: PinnedLink }
  | { kind: "voice"; voiceId: string; voiceName: string; channels: PinnedLink[] };

/**
 * A pinned Vessel on Home — the person/org named once, its pinned channels shown
 * as platform chips on the same row (like the library's By-Vessel view). Each chip
 * opens its channel; the name + chevron lead to the Vessel page.
 */
function PinnedVoiceRow({
  voiceId,
  voiceName,
  channels,
}: {
  voiceId: string;
  voiceName: string;
  channels: PinnedLink[];
}) {
  return (
    <SectionRow className="border-t border-border/60 pl-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to="/voice/$voiceId"
            params={{ voiceId }}
            className="block truncate text-sm font-medium text-foreground hover:text-primary"
          >
            {voiceName}
          </Link>
          <div className="mt-1 flex flex-wrap gap-1">
            {channels.map((c) => {
              const Icon = c.platform ? PLATFORM_ICON[c.platform] : ExternalLink;
              return (
                <ExtLink
                  key={c.url ?? c.platform}
                  href={c.url ?? "#"}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-primary"
                >
                  <Icon className="size-3" aria-hidden />
                  {c.platform ? LINK_PLATFORM_LABELS[c.platform] : (c.label ?? "Link")}
                </ExtLink>
              );
            })}
          </div>
        </div>
        <Link
          to="/voice/$voiceId"
          params={{ voiceId }}
          aria-label={`Open ${voiceName}`}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </SectionRow>
  );
}

/**
 * One pinned link on Home — a pinned Voice channel or Content link. Opens the
 * link out; a chevron leads to the owning record (a Voice or a Content page).
 */
function PinnedLinkRow({
  pin,
  onReflect,
  onSetStatus,
}: {
  pin: PinnedLink;
  onReflect: (ownerId: string) => void;
  onSetStatus: (ownerId: string, status: KnowledgeStatus) => void;
}) {
  // Describe a content pin by what it *is* (its category — "Book") rather than the
  // link's label ("Amazon"), which is only where to get it. The link is conveyed by
  // the platform icon + the row opening it.
  const subtitle =
    pin.subtitle ||
    (pin.ownerType === "content" && pin.category ? CATEGORY_LABELS[pin.category] : "") ||
    pin.label ||
    (pin.platform ? LINK_PLATFORM_LABELS[pin.platform] : "");
  // ACTS-145: content pins in a status-bearing category (book/program/video/podcast)
  // carry a progress status. Show it as a compact, tappable eyebrow on the same line
  // as the link so the row height doesn't grow; tapping cycles Not started → In
  // progress → Finished → back around, in sync with Formation's ContentRow.
  const showStatus = pin.category != null && hasStatus(pin.category);
  // The platform icon sits by the channel/source line (not the title), matching
  // the library chips (ACTS-178).
  const PlatformIconEl = pin.platform ? PLATFORM_ICON[pin.platform] : null;
  const body = (
    <span className="min-w-0">
      <span className="block truncate text-sm font-medium text-foreground">{pin.ownerName}</span>
      {subtitle ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {PlatformIconEl ? <PlatformIconEl className="size-3 shrink-0" aria-hidden /> : null}
          <span className="truncate">{subtitle}</span>
        </span>
      ) : null}
    </span>
  );
  return (
    <SectionRow className="border-t border-border/60 pl-6">
      <div className="flex items-center justify-between gap-3">
        {pin.url ? (
          <ExtLink
            href={pin.url}
            className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-primary"
          >
            {body}
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          </ExtLink>
        ) : (
          // URL-less item pin (ACTS-137): open the item's detail page in-app.
          <Link
            to="/knowledge/$knowledgeId"
            params={{ knowledgeId: pin.ownerId }}
            className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-primary"
          >
            {body}
          </Link>
        )}
        {/* Status eyebrow (ACTS-145) — current status only, tap to cycle; read-only
            categories (article/post/quote) and voice pins get nothing here. */}
        {showStatus ? (
          <button
            type="button"
            onClick={() => onSetStatus(pin.ownerId, nextStatus(pin.status))}
            aria-label={`Status: ${statusLabel(pin.status)}. Tap to change.`}
            title={`${statusLabel(pin.status)} — tap to change`}
            className={`shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide transition-colors hover:text-foreground ${
              pin.status === "finished"
                ? "text-primary"
                : pin.status === "in_progress"
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            {statusLabel(pin.status)}
          </button>
        ) : null}
        {/* Reflect on the work itself — only content vessels (books/programs) are
            reflection subjects; a voice/website channel is not. */}
        {pin.ownerType === "content" ? (
          <IconAction
            label={`Write a reflection about ${pin.ownerName}`}
            onClick={() => onReflect(pin.ownerId)}
          >
            <span>
              <NotebookPen className="size-4" aria-hidden />
            </span>
          </IconAction>
        ) : null}
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

/**
 * Pick what the Home "daily" card starts: a devotion prayed here, or a hand-off
 * to another app (Hallow &c). Both live in one list because they are one choice
 * — external mode outranks the chosen devotion on the Daily Rosary row, so a
 * picker offering only devotions would appear to do nothing while Hallow is on.
 * Persisted in settings.
 */
function ChangeDevotionDialog({
  open,
  onOpenChange,
  templates,
  currentId,
  externalAppId,
  customAppLabel,
  onChooseTemplate,
  onChooseApp,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templates: PrayerTemplate[];
  currentId: string | undefined;
  /** The chosen app's id while the daily opens externally; null when prayed here. */
  externalAppId: string | null;
  /** Domain label shown for the custom app once Settings has a URL for it. */
  customAppLabel: string | null;
  onChooseTemplate: (id: string | undefined) => void;
  onChooseApp: (appId: string) => void;
}) {
  function Row({
    title,
    subtitle,
    checked,
    onSelect,
  }: {
    title: string;
    subtitle?: string | undefined;
    checked: boolean;
    onSelect: () => void;
  }) {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            onSelect();
            onOpenChange(false);
          }}
          className="flex w-full items-center justify-between gap-3 py-3 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{title}</span>
            {subtitle ? (
              <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
            ) : null}
          </span>
          {checked ? <Check className="size-4 shrink-0 text-primary" aria-hidden /> : null}
        </button>
      </li>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">Daily devotion</DialogTitle>
          <DialogDescription>
            Choose the devotion your daily prayer starts from — or the app it opens in.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          <p className="eyebrow pb-1 pt-1">Pray here</p>
          <ul className="divide-y divide-border/60">
            <Row
              title="Standard Holy Rosary"
              subtitle="App default"
              checked={!externalAppId && currentId === undefined}
              onSelect={() => onChooseTemplate(undefined)}
            />
            {templates.map((t) => (
              <Row
                key={t.id}
                title={t.name}
                subtitle={t.description ?? undefined}
                checked={!externalAppId && currentId === t.id}
                onSelect={() => onChooseTemplate(t.id)}
              />
            ))}
          </ul>
          <p className="eyebrow pb-1 pt-4">Open in another app</p>
          <ul className="divide-y divide-border/60">
            {PRAYER_APPS.map((a) => (
              <Row
                key={a.id}
                title={a.id === "other" ? (customAppLabel ?? a.name) : a.name}
                subtitle={a.blurb}
                checked={externalAppId === a.id}
                onSelect={() => onChooseApp(a.id)}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Index() {
  const {
    db,
    startSession,
    startBuiltSession,
    setDailyTemplate,
    updateSettings,
    logExternalDailyRosary,
    setKnowledgeStatus,
  } = useApp();
  const navigate = useNavigate();
  const today = todayISO();
  const [journalLinkId, setJournalLinkId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // The liturgical day names today's readings (season + governing saint/feast).
  // Computed client-side to match WordSection and dodge an SSR/timezone hydration
  // mismatch — falls back to "Daily Readings" until it resolves post-mount, so a
  // reflection tagged from the readings snapshots the specific day, not the label.
  const [litDay, setLitDay] = useState<LiturgicalDay | null>(null);
  useEffect(() => setLitDay(getLiturgicalDay(todayISO())), []);

  // The Vessels card is a quiet library that sits last on Home — collapsed by
  // default, its open/closed state remembered per browser. Start closed (matches
  // SSR) and only open post-mount if the stored preference says so, so there's no
  // hydration flash.
  const [vesselsOpen, setVesselsOpen] = useState(false);
  useEffect(() => {
    try {
      setVesselsOpen(window.localStorage.getItem(VESSELS_OPEN_KEY) === "1");
    } catch {
      /* storage blocked — stay collapsed */
    }
  }, []);
  const toggleVessels = (open: boolean) => {
    setVesselsOpen(open);
    try {
      window.localStorage.setItem(VESSELS_OPEN_KEY, open ? "1" : "0");
    } catch {
      /* storage blocked — remember for this session only */
    }
  };

  // The "Upcoming" list (scheduled later this week) sits below today's sessions,
  // collapsed by default so what's due today stays front-and-center (ACTS-192).
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  useEffect(() => {
    try {
      setUpcomingOpen(window.localStorage.getItem(UPCOMING_OPEN_KEY) === "1");
    } catch {
      /* storage blocked — stay collapsed */
    }
  }, []);
  const toggleUpcoming = (open: boolean) => {
    setUpcomingOpen(open);
    try {
      window.localStorage.setItem(UPCOMING_OPEN_KEY, open ? "1" : "0");
    } catch {
      /* storage blocked — remember for this session only */
    }
  };

  const setId = resolveMysterySet(db, defaultContext({ date: today }));
  const setName = db.mystery_sets.find((s) => s.id === setId)?.name ?? "Mysteries";

  const dailyId = db.settings?.daily_template_id;
  const daily =
    (dailyId ? db.templates.find((t) => t.id === dailyId) : undefined) ??
    db.templates.find((t) => t.id === "tpl-rosary") ??
    db.templates[0];
  const isRosary = (daily?.mystery_count ?? 0) > 0;

  const openSessions = db.sessions.filter((s) => !s.completed_at);
  const completedSessions = db.sessions.filter((s) => s.completed_at);
  // `completed_at` is a full UTC timestamp; `today` is the local calendar day.
  // Compare by local day (dayOf) so an evening prayer doesn't roll to "tomorrow"
  // in a negative-offset zone and vanish from Done (ACTS-192, cf. todayISO).
  const isToday = (iso?: string) => !!iso && dayOf(iso) === today;
  const latestDoneToday = (match: (s: (typeof completedSessions)[number]) => boolean) =>
    completedSessions
      .filter((s) => isToday(s.completed_at) && match(s))
      .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))[0];
  // A plan's current occurrence (at plan.date) is fulfilled when a completed
  // session records that scheduled day. A one-time plan has a single occurrence,
  // so any completion finishes it. Lets a done session drop out of "upcoming"
  // without relying on the plan having rolled forward — the fix for a finished
  // future one-time session lingering as a start-able to-do (ACTS-192).
  const occurrenceDone = (plan: SessionPlan) => {
    if ((plan.recurrence?.freq ?? "none") === "none") {
      return completedSessions.some((s) => s.plan_id === plan.id);
    }
    return completedSessions.some(
      (s) => s.plan_id === plan.id && (s.scheduled_date ?? s.context?.date) === plan.date,
    );
  };

  // A scheduled novena can stand in for today's Daily Rosary. While it does, the
  // Daily Rosary row is fulfilled by that plan — keeps the label, shows "Day X of
  // N", routes to the novena — and reverts to the standalone daily when it ends.
  const dailyFulfiller = activeDailyRosaryFulfiller(db.session_plans, today);
  const dailyOcc = dailyFulfiller
    ? occurrenceInfo(
        dailyFulfiller.starts_on ?? dailyFulfiller.date ?? today,
        dailyFulfiller.recurrence,
        today,
      )
    : null;
  const dailyDayLabel = dailyOcc?.total ? `Day ${dailyOcc.index} of ${dailyOcc.total}` : null;

  // The Daily Rosary can launch an external app (e.g. Hallow) instead of an in-app
  // session — but a novena standing in for it (dailyFulfiller) still takes over.
  const externalDaily = !dailyFulfiller && isExternalDailyRosary(db.settings);
  const dailyLaunchUrl = externalDaily ? resolveDailyRosaryUrl(db.settings) : "";
  const dailyAppLabel = dailyRosaryAppLabel(db.settings);

  // The daily row shows the chosen devotion (with the day's mysteries when it's a
  // rosary) — or, when deferred, the novena standing in for it and its Day X of N —
  // or, in external mode, the app it opens in.
  const dailySubtitle = dailyFulfiller
    ? [planTitle(db, dailyFulfiller), dailyDayLabel].filter(Boolean).join(" · ")
    : externalDaily
      ? `Opens in ${dailyAppLabel}`
      : isRosary
        ? `${daily?.name ?? "Rosary"} · ${setName}`
        : (daily?.name ?? "Prayer");

  // The daily's session: while deferred it's the novena's (by plan_id), otherwise
  // the daily's own ad-hoc session (no plan). Either way the row reflects its state.
  const dailyOpen = externalDaily
    ? undefined // external mode never has an in-app session to continue
    : dailyFulfiller
      ? openSessions.find((s) => s.plan_id === dailyFulfiller.id)
      : daily
        ? openSessions.find((s) => s.template_id === daily.id && !s.plan_id)
        : undefined;
  const dailyDone = dailyOpen
    ? undefined
    : dailyFulfiller
      ? latestDoneToday((s) => s.plan_id === dailyFulfiller.id)
      : daily
        ? latestDoneToday((s) => s.template_id === daily.id && !s.plan_id)
        : undefined;

  // Each today session resolves to ONE state — start (Today), continue, or done —
  // never doubled. Completed sessions stay visible as "Done" for the day, deduped
  // to one per devotion (the daily is shown on its own row).
  const representedIds = new Set<string>();
  const doneSeen = new Set<string>(daily ? [daily.id] : []);
  const continueList: { id: string; title: string; sessionId: string }[] = [];
  const todayList: { id: string; title: string; planId: string; date: string }[] = [];
  // Scheduled later this week (after today) — shown under a collapsed "Upcoming"
  // list, and not startable from here: just a look-ahead (ACTS-192). `count` is
  // how many times a recurring plan lands within the week, so a daily reads "7"
  // beside its next date rather than looking like a lone one-off.
  const upcomingList: {
    id: string;
    title: string;
    planId: string;
    date: string;
    count: number;
  }[] = [];
  const doneList: {
    id: string;
    title: string;
    sessionId: string;
    scheduled?: string;
  }[] = [];
  const addDone = (
    key: string,
    row: { id: string; title: string; sessionId: string; scheduled?: string },
  ) => {
    if (doneSeen.has(key)) return;
    doneSeen.add(key);
    doneList.push(row);
  };
  // The "Today" list also looks a week ahead: plans due within the next 7 days show
  // inline, each with its date, soonest first — so what's coming is visible without
  // opening the Plan tab. Each plan appears once at its stored next occurrence; a
  // recurrence is not expanded into one row per day (a daily plan would flood the week).
  const HORIZON_DAYS = 7;
  const weekHorizon = (() => {
    const d = new Date(`${today}T00:00`);
    d.setDate(d.getDate() + HORIZON_DAYS);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  // How many times a plan recurs within the look-ahead window [plan.date,
  // weekHorizon] — so a daily can show "+N this week" beside its next date
  // without listing every day (ACTS-192). A one-time plan lands once.
  const occurrencesThisWeek = (plan: SessionPlan): number => {
    if ((plan.recurrence?.freq ?? "none") === "none") return 1;
    const startsOn = plan.starts_on ?? plan.date;
    let count = 0;
    let d: string | null = plan.date ?? null;
    while (d && d <= weekHorizon) {
      count += 1;
      d = nextOccurrence(startsOn, plan.recurrence, d);
    }
    return count;
  };
  const upcomingPlans = db.session_plans
    .filter((p) => p.date != null && p.date >= today && p.date <= weekHorizon)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  for (const plan of upcomingPlans) {
    // The novena standing in for the Daily Rosary is shown on the Daily row only.
    if (plan.id === dailyFulfiller?.id) continue;
    const title = planTitle(db, plan);
    const openS = openSessions.find((s) => s.plan_id === plan.id);
    if (openS) {
      representedIds.add(openS.id);
      continueList.push({ id: plan.id, title, sessionId: openS.id });
    } else if (occurrenceDone(plan)) {
      // This occurrence is done — surfaced as Done by the completed-sessions pass
      // below (when finished today). Kept out of Today/upcoming so a finished
      // session — including a future one-time prayed early — doesn't reappear as
      // a start-able to-do (ACTS-192).
    } else if (plan.date === today) {
      todayList.push({ id: plan.id, title, planId: plan.id, date: plan.date });
    } else {
      // Scheduled a later day this week — the collapsed "Upcoming" look-ahead.
      // Shown once at its next date, with a count if it recurs across the week.
      upcomingList.push({
        id: plan.id,
        title,
        planId: plan.id,
        date: plan.date ?? today,
        count: occurrencesThisWeek(plan),
      });
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
    // A completed novena that's fulfilling the Daily Rosary shows on the Daily row.
    if (s.plan_id && s.plan_id === dailyFulfiller?.id) continue;
    const plan = s.plan_id ? db.session_plans.find((p) => p.id === s.plan_id) : undefined;
    const title = plan ? planTitle(db, plan) : s.title?.trim() || "Prayer session";
    // Prayed on a different day than scheduled? Note the scheduled day so a
    // done-early session reads honestly (collapsed when they match) (ACTS-192).
    const scheduled =
      s.scheduled_date && s.scheduled_date !== dayOf(s.completed_at ?? "")
        ? s.scheduled_date
        : undefined;
    addDone(plan?.template_id || s.template_id || s.id, {
      id: s.id,
      title,
      sessionId: s.id,
      ...(scheduled ? { scheduled } : {}),
    });
  }

  function openJournal(linkId: string) {
    setJournalLinkId(linkId);
    document.getElementById("reflection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function beginDaily() {
    // Resume the in-progress daily session rather than starting a duplicate.
    if (dailyOpen) {
      navigate({ to: "/session/$sessionId", params: { sessionId: dailyOpen.id } });
      return;
    }
    // While a novena stands in for the Daily Rosary, "begin" prays that novena.
    if (dailyFulfiller) {
      beginPlan(dailyFulfiller.id);
      return;
    }
    if (!daily) return;
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

  // Shared with the /reflections composer so the two pickers never drift (ACTS-136).
  const linkables: LinkableItem[] = buildReflectionLinkables(db, {
    dailyReadingLabel: litDay?.title,
  });

  // Home Vessels card: the links you've pinned — Voice channels and Content links.
  // Curated by the pin, not auto-surfaced.
  const homePins = pinnedLinks(db.voices, db.knowledge_items);
  // Group a Vessel's pinned channels onto one row (its channels shown as chips),
  // like the library's By-Vessel view; content pins stay as their own rows.
  const homeRows: HomePinRow[] = [];
  const voiceRowIndex = new Map<string, number>();
  for (const pin of homePins) {
    if (pin.ownerType === "voice") {
      const at = voiceRowIndex.get(pin.ownerId);
      if (at != null) {
        (homeRows[at] as { channels: PinnedLink[] }).channels.push(pin);
      } else {
        voiceRowIndex.set(pin.ownerId, homeRows.length);
        homeRows.push({
          kind: "voice",
          voiceId: pin.ownerId,
          voiceName: pin.ownerName,
          channels: [pin],
        });
      }
    } else {
      homeRows.push({ kind: "content", pin });
    }
  }

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
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/import", search: { mode: "single" } })}
                  >
                    <Plus className="size-4" aria-hidden /> New prayer
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
                {externalDaily ? (
                  <ExtLink
                    href={dailyLaunchUrl}
                    aria-label={`Open the daily rosary in ${dailyAppLabel}`}
                    title={`Open in ${dailyAppLabel}`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-primary hover:bg-accent/40"
                    onClick={() =>
                      logExternalDailyRosary({ appLabel: dailyAppLabel, url: dailyLaunchUrl })
                    }
                  >
                    <ExternalLink className="size-4" aria-hidden />
                  </ExtLink>
                ) : (
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
                )}
              </div>
            </div>

            {/* In-progress sessions to continue (never doubled with a Today row) */}
            {continueList.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3 transition-colors hover:bg-accent/40"
              >
                <Link
                  to="/session/$sessionId"
                  params={{ sessionId: row.sessionId }}
                  className="min-w-0 flex-1"
                >
                  <span className="eyebrow block">Continue</span>
                  <span className="block truncate font-display text-base">{row.title}</span>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconAction
                    label={`Write a reflection about ${row.title}`}
                    onClick={() => openJournal(row.sessionId)}
                  >
                    <span>
                      <NotebookPen className="size-4" aria-hidden />
                    </span>
                  </IconAction>
                  <Link
                    to="/session/$sessionId"
                    params={{ sessionId: row.sessionId }}
                    aria-label={`Continue ${row.title}`}
                  >
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </div>
              </div>
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
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconAction
                    label={`Write a reflection about ${row.title}`}
                    onClick={() => openJournal(row.planId)}
                  >
                    <span>
                      <NotebookPen className="size-4" aria-hidden />
                    </span>
                  </IconAction>
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
              </div>
            ))}

            {/* Completed today — kept visible as Done; tap to review. */}
            {doneList.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3 transition-colors hover:bg-accent/40"
              >
                <Link
                  to="/session/$sessionId"
                  params={{ sessionId: row.sessionId }}
                  className="min-w-0 flex-1"
                >
                  <span className="eyebrow block text-muted-foreground">
                    {row.scheduled ? `Done · scheduled ${dayShort(row.scheduled)}` : "Done"}
                  </span>
                  <span className="block truncate font-display text-base text-muted-foreground">
                    {row.title}
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconAction
                    label={`Write a reflection about ${row.title}`}
                    onClick={() => openJournal(row.sessionId)}
                  >
                    <span>
                      <NotebookPen className="size-4" aria-hidden />
                    </span>
                  </IconAction>
                  <Link
                    to="/session/$sessionId"
                    params={{ sessionId: row.sessionId }}
                    aria-label={`Review ${row.title}`}
                  >
                    <Check className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </div>
              </div>
            ))}

            {/* Upcoming — scheduled later this week. Collapsed by default and not
                startable from here (a look-ahead, not a to-do), so today's
                sessions stay front-and-center (ACTS-192). */}
            {upcomingList.length > 0 ? (
              <Collapsible open={upcomingOpen} onOpenChange={toggleUpcoming}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 border-t border-border/60 bg-muted/50 px-5 py-2.5 text-left transition-colors hover:bg-muted">
                  <span className="eyebrow font-medium text-foreground/70">Upcoming this week</span>
                  <ChevronDown
                    className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {upcomingList.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3"
                    >
                      <span className="min-w-0">
                        <span className="eyebrow block text-muted-foreground">
                          {dayShort(row.date)}
                        </span>
                        <span className="block truncate font-display text-base text-muted-foreground">
                          {row.title}
                        </span>
                      </span>
                      {row.count > 1 ? (
                        <span
                          className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          aria-label={`${row.count} times this week`}
                        >
                          {row.count}×
                        </span>
                      ) : null}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        </Card>

        {/* C — Word */}
        <SectionCard
          title="Word"
          actions={
            <>
              <OnlineBibleLink />
              <IconAction label="Open the full Word page" asChild>
                <Link to="/word">
                  <BookOpen className="size-4" aria-hidden />
                </Link>
              </IconAction>
            </>
          }
        >
          <WordSection onReflect={openJournal} />
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

        {/* Vessels — the library of pinned channels & links, kept last and collapsed
            so it stays available without crowding the daily surfaces (ACTS-182). */}
        <SectionCard
          title={SECTION_LABEL_LONG}
          collapsible
          open={vesselsOpen}
          onOpenChange={toggleVessels}
          actions={
            <IconAction label="Add & browse your library" asChild>
              <Link to="/formation" search={{ add: true }}>
                <Plus className="size-4" aria-hidden />
              </Link>
            </IconAction>
          }
        >
          {homeRows.length === 0 ? (
            <SectionRow className="border-t border-border/60">
              <p className="text-sm text-muted-foreground">
                Pin a channel or link in your library to show it here.
              </p>
            </SectionRow>
          ) : (
            homeRows.map((row) =>
              row.kind === "voice" ? (
                <PinnedVoiceRow
                  key={`voice-${row.voiceId}`}
                  voiceId={row.voiceId}
                  voiceName={row.voiceName}
                  channels={row.channels}
                />
              ) : (
                <PinnedLinkRow
                  key={`${row.pin.ownerId}-${row.pin.url ?? "pin"}`}
                  pin={row.pin}
                  onReflect={openJournal}
                  onSetStatus={setKnowledgeStatus}
                />
              ),
            )
          )}
        </SectionCard>
      </div>

      <ChangeDevotionDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        templates={db.templates}
        currentId={dailyId}
        externalAppId={externalDaily ? effectivePrayerAppId(db.settings) : null}
        customAppLabel={db.settings?.daily_rosary_custom_url ? dailyAppLabel : null}
        onChooseTemplate={(id) => {
          setDailyTemplate(id);
          // External mode outranks the chosen devotion on the Daily Rosary row,
          // so picking one here has to return the daily to in-app.
          if (externalDaily) updateSettings({ daily_rosary_mode: "app" });
        }}
        onChooseApp={(appId) => {
          updateSettings({ daily_rosary_mode: "external", daily_rosary_app_id: appId });
          // "Another app or website" needs an address, and Settings is the only
          // place to type one — so hand off there when it isn't set yet.
          if (appId === "other" && !db.settings?.daily_rosary_custom_url) {
            navigate({ to: "/settings" });
          }
        }}
      />
    </AppShell>
  );
}
