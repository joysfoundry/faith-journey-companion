import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Copy,
  FilePlus2,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevotionItemsEditor } from "@/components/prayer/DevotionItemsEditor";
import { ShareDialog } from "@/components/prayer/ShareDialog";
import { buildSharePayload } from "@/lib/prayer/share";
import { useApp } from "@/lib/prayer/store";
import {
  activeDailyRosaryFulfiller,
  allMysteryBodies,
  deferralWindowsOverlap,
  estimateMinutes,
  generatePrayerSession,
  listenSourcesFromItems,
  newId,
  occurrenceInfo,
  planTitle,
  recurrenceLabel,
  seriesEndDate,
  todayISO,
} from "@/lib/prayer/compiler";
import type {
  Database,
  Frequency,
  MysteryPresentation,
  PrayerHour,
  PrayerTemplate,
  ProgressMode,
  Pronoun,
  Recurrence,
  SessionContext,
  SessionPlan,
  TemplateItem,
} from "@/lib/prayer/types";
import {
  buildRecurrence,
  FREQ_OPTIONS,
  FREQ_UNIT_LABEL,
  recurrenceFields,
  type EndMode,
} from "@/lib/prayer/recurrence";

export const Route = createFileRoute("/pray")({
  validateSearch: (search: Record<string, unknown>): { build?: boolean } =>
    search["build"] === "1" || search["build"] === true ? { build: true } : {},
  head: () => ({
    meta: [
      { title: "Pray Plan — ACTS" },
      {
        name: "description",
        content:
          "Build prayer sessions and see what's upcoming and completed — start from a devotion or from scratch, add prayers and petitions, set how you listen and when to pray it.",
      },
      { property: "og:title", content: "Pray Plan — ACTS" },
      {
        property: "og:description",
        content:
          "Start from a devotion or add prayers freely — sessions expand into a full prayer.",
      },
    ],
  }),
  component: PrayPage,
});

const HOUR_LABEL: Record<PrayerHour, string> = {
  office_of_readings: "Office of Readings",
  lauds: "Morning Prayer (Lauds)",
  daytime: "Daytime Prayer",
  vespers: "Evening Prayer (Vespers)",
  compline: "Night Prayer (Compline)",
};

/**
 * Compile an upcoming plan into a session + items **without persisting it** — so it
 * can be shared ahead of time. Mirrors the store's `startBuiltSession` compile path
 * (custom plan items win over the base template's; the purpose becomes the title).
 */
function compilePlanSession(db: Database, plan: SessionPlan, today: string) {
  const planItems: TemplateItem[] =
    plan.items ??
    db.template_items
      .filter((i) => i.template_id === plan.template_id)
      .sort((a, b) => a.position - b.position);
  const base = plan.template_id ? db.templates.find((t) => t.id === plan.template_id) : undefined;
  const workId = base?.id ?? "plan-share-preview";
  const mysteryCount = planItems.filter((i) => i.kind === "mystery_placeholder").length;
  const template: PrayerTemplate = base
    ? { ...base, mystery_count: mysteryCount }
    : {
        id: workId,
        name: plan.purpose?.trim() || "Prayer session",
        kind: mysteryCount > 0 ? "rosary" : "standard",
        mystery_presentation: "title_and_description",
        mystery_count: mysteryCount,
        built_in: false,
        created_at: "",
      };
  const previewDb: Database = {
    ...db,
    template_items: [
      ...db.template_items.filter((i) => i.template_id !== workId),
      ...planItems.map((it, i) => ({ ...it, template_id: workId, position: i })),
    ],
  };
  const { session, items } = generatePrayerSession(previewDb, template, {
    date: today,
    ...plan.context,
  });
  const titled = plan.purpose?.trim() ? { ...session, title: plan.purpose.trim() } : session;
  return { session: titled, items };
}

/** Share icon for an upcoming plan — compiles it lazily and opens the shared dialog. */
function PlanShareButton({ db, plan, today }: { db: Database; plan: SessionPlan; today: string }) {
  const payload = useMemo(() => {
    const { session, items } = compilePlanSession(db, plan, today);
    return buildSharePayload(session, items);
  }, [db, plan, today]);
  return (
    <ShareDialog
      payload={payload}
      allowEditCover
      trigger={
        <button
          type="button"
          aria-label="Share session"
          className="p-1.5 text-muted-foreground hover:text-foreground"
        >
          <Share2 className="size-4" />
        </button>
      }
    />
  );
}

function PrayPage() {
  const {
    db,
    ready,
    startSession,
    startBuiltSession,
    deleteSession,
    saveSessionPlan,
    deleteSessionPlan,
    saveTemplate,
  } = useApp();
  const navigate = useNavigate();
  const { build } = Route.useSearch();
  const today = todayISO();

  const seedItems = (tid: string): TemplateItem[] =>
    db.template_items
      .filter((i) => i.template_id === tid)
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i }));

  const [tab, setTab] = useState<"builder" | "sessions">(build ? "builder" : "sessions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  // Optional dedication: pray this session "for" a named soul. Blank name +
  // "they" = no dedication (prayers read in the generic/plural form).
  const [forWhomName, setForWhomName] = useState("");
  const [forWhomPronoun, setForWhomPronoun] = useState<Pronoun>("they");
  const [dateVal, setDateVal] = useState(today);
  const [freq, setFreq] = useState<Frequency>("none");
  const [interval, setIntervalVal] = useState("1");
  const [endMode, setEndMode] = useState<EndMode>("never");
  const [count, setCount] = useState("");
  const [untilVal, setUntilVal] = useState("");
  const [fulfillsDaily, setFulfillsDaily] = useState(false);
  const [hour, setHour] = useState<PrayerHour | "">("");
  const [startTime, setStartTime] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [originIds, setOriginIds] = useState<Set<string>>(new Set());
  const [progressMode, setProgressMode] = useState<ProgressMode>("scroll");
  const [mysterySet, setMysterySet] = useState("auto");
  const [presentation, setPresentation] = useState<MysteryPresentation | "template">("template");
  const [mysteryBody, setMysteryBody] = useState("template");
  const [listenIndex, setListenIndex] = useState("");

  const baseTemplate = templateId ? db.templates.find((t) => t.id === templateId) : undefined;
  const mysteryCount = items.filter((i) => i.kind === "mystery_placeholder").length;
  // "Defer the Daily Rosary to this novena" only applies to a rosary on a bounded
  // series (a novena has an end — an open-ended daily rosary can't stand in for itself).
  const isBounded = freq !== "none" && (endMode === "count" || endMode === "until");
  const canDeferDaily = mysteryCount > 0 && isBounded;
  // Preview of the deferral window from the current builder fields. The series is
  // anchored at starts_on (stable across edits), so a back-dated start still shows
  // the right "Day X of N" for today.
  const deferStart =
    (editingId ? db.session_plans.find((p) => p.id === editingId)?.starts_on : undefined) ??
    dateVal;
  const deferRec = buildRecurrence({ freq, interval, endMode, count, until: untilVal });
  const deferEnd = canDeferDaily ? seriesEndDate(deferStart, deferRec) : undefined;
  const deferTodayOcc = canDeferDaily ? occurrenceInfo(deferStart, deferRec, today) : null;
  const deferLengthLabel = deferRec.count
    ? `${deferRec.count} ${FREQ_UNIT_LABEL[freq]}s`
    : deferEnd
      ? `through ${deferEnd}`
      : "its duration";
  const sources = listenSourcesFromItems(db, items, baseTemplate?.media ?? []);
  const chosenSource = sources[Number(listenIndex)];

  // The app derives the estimate from the fully-expanded session (same compile
  // the real session uses), so it reflects repetitions, mysteries, and edits.
  const estMin = useMemo(() => {
    if (items.length === 0) return 0;
    const workId = templateId || "adhoc-preview";
    const previewTemplate: PrayerTemplate = baseTemplate
      ? { ...baseTemplate, mystery_count: mysteryCount }
      : {
          id: workId,
          name: purpose.trim() || "Prayer session",
          kind: mysteryCount > 0 ? "rosary" : "standard",
          mystery_presentation: "title_and_description",
          mystery_count: mysteryCount,
          built_in: false,
          created_at: "",
        };
    const previewDb = {
      ...db,
      template_items: [
        ...db.template_items.filter((i) => i.template_id !== workId),
        ...items.map((it, i) => ({ ...it, template_id: workId, position: i })),
      ],
    };
    try {
      return estimateMinutes(generatePrayerSession(previewDb, previewTemplate, {}).items);
    } catch {
      return 0;
    }
  }, [items, templateId, baseTemplate, mysteryCount, purpose, db]);

  // Apply a Recurrence to the builder's schedule fields.
  const applyRecurrence = (r: Recurrence | undefined) => {
    const f = recurrenceFields(r);
    setFreq(f.freq);
    setIntervalVal(f.interval);
    setEndMode(f.endMode);
    setCount(f.count);
    setUntilVal(f.until);
  };

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    setItems(id ? seedItems(id) : []);
    setOriginIds(new Set(id ? seedItems(id).map((i) => i.id) : []));
    setListenIndex("");
    setMysterySet("auto");
    setPresentation("template");
    setMysteryBody("template");
    // Pre-fill the schedule from the devotion's defaults (user can override).
    const tpl = id ? db.templates.find((t) => t.id === id) : undefined;
    applyRecurrence(tpl?.default_recurrence);
    setHour(tpl?.default_hour ?? "");
    setStartTime(tpl?.default_start_time ?? "");
  };

  const resetForm = () => {
    setEditingId(null);
    setPurpose("");
    setForWhomName("");
    setForWhomPronoun("they");
    setDateVal(today);
    applyRecurrence(undefined);
    setFulfillsDaily(false);
    setHour("");
    setStartTime("");
    setProgressMode("scroll");
    pickTemplate("");
  };

  const loadPlan = (plan: SessionPlan) => {
    setEditingId(plan.id);
    setPurpose(plan.purpose ?? "");
    setForWhomName(plan.context.for_whom?.name ?? "");
    setForWhomPronoun(plan.context.for_whom?.pronoun ?? "they");
    setDateVal(plan.date ?? today);
    applyRecurrence(plan.recurrence);
    setFulfillsDaily(plan.fulfills_daily_rosary ?? false);
    setHour(plan.hour ?? "");
    setStartTime(plan.start_time ?? "");
    setTemplateId(plan.template_id);
    const planItems = plan.items ?? seedItems(plan.template_id);
    setItems(planItems.map((i) => ({ ...i })));
    setOriginIds(new Set(seedItems(plan.template_id).map((i) => i.id)));
    setProgressMode(plan.context.progress_mode ?? "scroll");
    setMysterySet(plan.context.mystery_set_id ?? "auto");
    setPresentation(plan.context.mystery_presentation ?? "template");
    setMysteryBody(plan.context.mystery_body ?? "template");
    const srcs = listenSourcesFromItems(
      db,
      planItems,
      (plan.template_id ? db.templates.find((t) => t.id === plan.template_id)?.media : []) ?? [],
    );
    const idx = srcs.findIndex((s) => s.url === plan.context.listen_source?.url);
    setListenIndex(idx >= 0 ? String(idx) : "");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dedicate only when a name is given — the pronoun personalizes that name.
  // With no name the prayers read in the generic plural form ("the faithful
  // departed / them / us"), so a leftover pronoun never yields a mismatched
  // "her" over a nameless soul.
  const dedication = forWhomName.trim()
    ? { for_whom: { name: forWhomName.trim(), pronoun: forWhomPronoun } }
    : {};

  const buildContext = (): Partial<SessionContext> => ({
    progress_mode: progressMode,
    ...(mysterySet !== "auto" ? { mystery_set_id: mysterySet } : {}),
    ...(presentation !== "template" ? { mystery_presentation: presentation } : {}),
    ...(mysteryBody !== "template" ? { mystery_body: mysteryBody } : {}),
    ...(chosenSource ? { listen_source: chosenSource, audio_enabled: true } : {}),
    ...dedication,
  });

  const saveSession = () => {
    if (items.length === 0) {
      toast.error("Add at least one prayer to the session.");
      return;
    }
    const existingPlan = editingId ? db.session_plans.find((p) => p.id === editingId) : undefined;
    const deferDaily = canDeferDaily && fulfillsDaily;
    const plan: SessionPlan = {
      id: editingId ?? newId("plan"),
      template_id: templateId,
      ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
      ...(dateVal ? { date: dateVal } : {}),
      // Anchor the series once; keep it stable across edits so "Day N" holds.
      ...(dateVal ? { starts_on: existingPlan?.starts_on ?? dateVal } : {}),
      recurrence: buildRecurrence({ freq, interval, endMode, count, until: untilVal }),
      ...(deferDaily ? { fulfills_daily_rosary: true } : {}),
      ...(hour ? { hour } : {}),
      ...(startTime ? { start_time: startTime } : {}),
      ...(estMin > 0 ? { duration_min: estMin } : {}),
      context: buildContext(),
      items: items.map((it, i) => ({ ...it, position: i })),
      created_at: existingPlan?.created_at || new Date().toISOString(),
    };
    // Only one novena may stand in for the Daily Rosary on a given day — block a
    // second deferral whose window overlaps one that's already opted in.
    if (deferDaily) {
      const clash = db.session_plans.find(
        (p) => p.id !== plan.id && p.fulfills_daily_rosary && deferralWindowsOverlap(plan, p),
      );
      if (clash) {
        toast.error(
          `"${planTitle(db, clash)}" is already standing in for your Daily Rosary during these dates. Turn that off first.`,
        );
        return;
      }
    }
    saveSessionPlan(plan);
    toast.success(editingId ? "Session updated" : "Session saved");
    resetForm();
  };

  const saveAsTemplate = () => {
    const name = purpose.trim();
    if (!name) {
      toast.error("Name it in Purpose first, then save it as a devotion.");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one prayer before saving a devotion.");
      return;
    }
    const tid = newId("tpl");
    const now = new Date().toISOString();
    const tpl: PrayerTemplate = {
      id: tid,
      name,
      kind: mysteryCount > 0 ? "rosary" : "standard",
      mystery_presentation: "title_and_description",
      mystery_count: mysteryCount,
      built_in: false,
      created_at: now,
    };
    saveTemplate(
      tpl,
      items.map((it, i) => ({ ...it, template_id: tid, position: i })),
    );
    // The session now starts from this new devotion — its items become "from the devotion".
    setTemplateId(tid);
    setOriginIds(new Set(items.map((i) => i.id)));
    toast.success("You can now use this devotion to build your prayer sessions.");
  };

  const beginPlan = (plan: SessionPlan) => {
    const planItems = plan.items ?? seedItems(plan.template_id);
    const session = startBuiltSession(
      plan.template_id || null,
      planItems,
      { date: today, ...plan.context },
      plan.purpose,
      plan.id,
    );
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  };

  const duplicatePlan = (plan: SessionPlan) => {
    saveSessionPlan({
      ...plan,
      id: newId("plan"),
      purpose: `Copy of ${planTitle(db, plan)}`,
      items: plan.items?.map((it) => ({ ...it })),
      created_at: new Date().toISOString(),
    });
    toast.success("Session duplicated — rename the copy");
  };

  const deleteCurrent = () => {
    if (!editingId) return;
    deleteSessionPlan(editingId);
    toast.success("Session deleted");
    resetForm();
  };

  const plans = [...db.session_plans].sort(
    (a, b) =>
      (a.date ?? "9999-99-99").localeCompare(b.date ?? "9999-99-99") ||
      a.created_at.localeCompare(b.created_at),
  );

  // The Daily Rosary is a setting (which devotion is "daily"), not stored data —
  // so it's a pinned virtual row. While a novena has opted to stand in for it
  // (fulfills_daily_rosary, today inside its window), that plan wears the DAILY
  // ROSARY label instead and the pinned row hides so there's no duplicate.
  const dailyFulfiller = activeDailyRosaryFulfiller(db.session_plans, today);
  const dailyTemplate =
    (db.settings?.daily_template_id
      ? db.templates.find((t) => t.id === db.settings?.daily_template_id)
      : undefined) ??
    db.templates.find((t) => t.id === "tpl-rosary") ??
    db.templates[0];
  const beginDailyRosary = () => {
    if (!dailyTemplate) return;
    const existing = db.sessions.find(
      (s) => !s.completed_at && s.template_id === dailyTemplate.id && !s.plan_id,
    );
    if (existing) {
      navigate({ to: "/session/$sessionId", params: { sessionId: existing.id } });
      return;
    }
    const session = startSession(dailyTemplate.id, { date: today, progress_mode: "scroll" });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  };

  const openSessions = db.sessions.filter((s) => !s.completed_at);
  const completedSessions = db.sessions
    .filter((s) => s.completed_at)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  const pageMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More actions"
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <MoreVertical className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={saveSession}>
          <Save className="size-4" /> {editingId ? "Update session" : "Save session"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={saveAsTemplate}>
          <FilePlus2 className="size-4" /> Save as devotion
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={resetForm}>
          <X className="size-4" /> Clear
        </DropdownMenuItem>
        {editingId ? (
          <DropdownMenuItem
            onClick={deleteCurrent}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" /> Delete session
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell title="Pray Plan" action={tab === "builder" ? pageMenu : undefined}>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "builder" | "sessions")}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="sessions">
            Sessions
            {plans.length + openSessions.length > 0 ? (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {plans.length + openSessions.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="builder">Session Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="space-y-4">
            {editingId ? (
              <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2 text-sm">
                <span className="font-medium">Editing a saved session</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 text-muted-foreground"
                >
                  <Plus className="size-4" /> New
                </button>
              </div>
            ) : null}

            <div className="soft-card space-y-3 p-4">
              <div>
                <Label htmlFor="purpose">Purpose (optional)</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  placeholder="e.g. Monthly Family Rosary"
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="for-whom">Prayed for (optional)</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="for-whom"
                    value={forWhomName}
                    placeholder="e.g. a departed loved one"
                    onChange={(e) => setForWhomName(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    aria-label="Pronoun for the person prayed for"
                    value={forWhomPronoun}
                    onChange={(e) => setForWhomPronoun(e.target.value as Pronoun)}
                    className="h-12 rounded-md border border-input bg-card px-3"
                  >
                    <option value="they">they/them</option>
                    <option value="she">she/her</option>
                    <option value="he">he/him</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  For a devotion offered for someone (e.g. the departed). Leave blank to pray it in
                  the general form.
                </p>
              </div>
              <div>
                <Label htmlFor="template">Start from a devotion?</Label>
                <select
                  id="template"
                  value={templateId}
                  onChange={(e) => pickTemplate(e.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                >
                  <option value="">No devotion — start adding prayers</option>
                  {db.templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  A devotion is a fast start — you can still add, remove, and reword anything for
                  this session without changing the devotion.
                </p>
              </div>
            </div>

            <div className="soft-card space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Start date to pray</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateVal}
                    onChange={(e) => setDateVal(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="freq">Repeats</Label>
                  <select
                    id="freq"
                    value={freq}
                    onChange={(e) => setFreq(e.target.value as Frequency)}
                    className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                  >
                    {FREQ_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {freq !== "none" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="interval">Every</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        id="interval"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={interval}
                        onChange={(e) => setIntervalVal(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {FREQ_UNIT_LABEL[freq]}
                        {Number(interval) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endmode">Ends</Label>
                    <select
                      id="endmode"
                      value={endMode}
                      onChange={(e) => setEndMode(e.target.value as EndMode)}
                      className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                    >
                      <option value="never">Never</option>
                      <option value="count">After N times</option>
                      <option value="until">On date</option>
                    </select>
                  </div>
                </div>
              ) : null}
              {freq !== "none" && endMode === "count" ? (
                <div>
                  <Label htmlFor="count">How many {FREQ_UNIT_LABEL[freq]}s?</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      id="count"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={count}
                      placeholder="e.g. 9 for a novena, 54 for a 54-day rosary"
                      onChange={(e) => setCount(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
              {freq !== "none" && endMode === "until" ? (
                <div>
                  <Label htmlFor="until">Until</Label>
                  <Input
                    id="until"
                    type="date"
                    value={untilVal}
                    onChange={(e) => setUntilVal(e.target.value)}
                    className="mt-2"
                  />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hour">Hour (tag, optional)</Label>
                  <select
                    id="hour"
                    value={hour}
                    onChange={(e) => setHour(e.target.value as PrayerHour | "")}
                    className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                  >
                    <option value="">No set hour</option>
                    {(Object.keys(HOUR_LABEL) as PrayerHour[]).map((h) => (
                      <option key={h} value={h}>
                        {HOUR_LABEL[h]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="start-time">Start time (optional)</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Est. time</Label>
                  <div className="mt-2 flex h-12 items-center rounded-md border border-input bg-muted/40 px-3 text-sm">
                    {estMin > 0 ? (
                      <span className="tabular-nums">~{estMin} min</span>
                    ) : (
                      <span className="text-muted-foreground">Add prayers to estimate</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Calculated from the prayers in this session.
                  </p>
                </div>
              </div>
            </div>

            {canDeferDaily ? (
              <div className="soft-card space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Label htmlFor="fulfills-daily" className="font-medium">
                      Pray my Daily Rosary through this
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Stands in for your Daily Rosary for {deferLengthLabel}. Your sessions list
                      keeps the <span className="font-medium">DAILY ROSARY</span> label and shows
                      “Day X of N”; the separate daily rosary returns when this finishes.
                    </p>
                  </div>
                  <Switch
                    id="fulfills-daily"
                    checked={fulfillsDaily}
                    onCheckedChange={setFulfillsDaily}
                    className="mt-1 shrink-0"
                  />
                </div>
                {fulfillsDaily && deferEnd ? (
                  <p className="text-xs text-muted-foreground">
                    {deferStart} → {deferEnd}
                    {deferTodayOcc?.total
                      ? ` · today is Day ${deferTodayOcc.index} of ${deferTodayOcc.total}`
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : null}

            {items.some(
              (i) => i.kind === "template_block" && (i.block_options?.length ?? 0) > 0,
            ) ? (
              <div className="soft-card space-y-3 p-4">
                <p className="eyebrow">Choose the parts</p>
                {items.map((item) =>
                  item.kind === "template_block" && (item.block_options?.length ?? 0) > 0 ? (
                    <div key={item.id}>
                      <Label htmlFor={`block-${item.id}`}>{item.label || "Section"}</Label>
                      <select
                        id={`block-${item.id}`}
                        value={item.block_template_id ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it) =>
                              it.id === item.id ? { ...it, block_template_id: val } : it,
                            ),
                          );
                        }}
                        className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                      >
                        {(item.block_options ?? []).map((optId) => (
                          <option key={optId} value={optId}>
                            {db.templates.find((t) => t.id === optId)?.name ?? optId}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}

            {mysteryCount > 0 ? (
              <div className="soft-card space-y-3 p-4">
                <div>
                  <Label htmlFor="mysteries">Mysteries</Label>
                  <select
                    id="mysteries"
                    value={mysterySet}
                    onChange={(e) => setMysterySet(e.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                  >
                    <option value="auto">Today&apos;s mysteries</option>
                    {db.mystery_sets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="presentation">Mystery descriptions</Label>
                  <select
                    id="presentation"
                    value={presentation}
                    onChange={(e) =>
                      setPresentation(e.target.value as MysteryPresentation | "template")
                    }
                    className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                  >
                    <option value="template">As saved in the devotion</option>
                    <option value="title_only">Title only</option>
                    <option value="title_and_description">Title and description</option>
                    <option value="choose_during_session">Ask me during the session</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="mysteryBody">Which version</Label>
                  <select
                    id="mysteryBody"
                    value={mysteryBody}
                    onChange={(e) => setMysteryBody(e.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                  >
                    <option value="template">As saved in the devotion</option>
                    {allMysteryBodies(db).map((b) => (
                      <option key={b.key} value={b.key}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            <div className="soft-card space-y-3 p-4">
              <div>
                <Label htmlFor="progress">Progress</Label>
                <select
                  id="progress"
                  value={progressMode}
                  onChange={(e) => setProgressMode(e.target.value as ProgressMode)}
                  className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                >
                  <option value="scroll">Scroll only — no tracking</option>
                  <option value="manual_done">Mark each prayer Done</option>
                </select>
              </div>
              <div>
                <Label htmlFor="listen">How do you want to listen?</Label>
                <select
                  id="listen"
                  value={listenIndex}
                  onChange={(e) => setListenIndex(e.target.value)}
                  disabled={sources.length === 0}
                  className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3 disabled:opacity-60"
                >
                  <option value="">Read silently — no audio</option>
                  {sources.map((s, i) => (
                    <option key={s.url} value={String(i)}>
                      {s.label} ({s.kind})
                    </option>
                  ))}
                </select>
                {sources.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No audio or video attached yet. Add an audio/video external link below, or
                    devotion media in the Devotion Builder.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Editable build surface — template items + session add-ons */}
            <div className="soft-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="eyebrow">Build your session</p>
                {originIds.size > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    <span className="mr-1 inline-block size-2 rounded-full bg-primary align-middle" />
                    added this session
                  </span>
                ) : null}
              </div>
              {items.length === 0 ? (
                <p className="mb-2 text-sm text-muted-foreground">
                  Start adding prayers, or choose a devotion above to start.
                </p>
              ) : null}
              <DevotionItemsEditor
                items={items}
                onChange={setItems}
                templateId={templateId || "session"}
                templateOriginIds={originIds}
              />
            </div>

            {/* Actions */}
            <Button className="h-12 w-full" onClick={saveSession}>
              <Save className="size-5" /> {editingId ? "Update session" : "Save session"}
            </Button>

            {!ready ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-4">
            {dailyTemplate && !dailyFulfiller ? (
              <section>
                <p className="eyebrow mb-2">Daily</p>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  <li className="flex items-center gap-3 px-3 py-2.5">
                    <span className="w-12 shrink-0 text-xs font-semibold text-primary tabular-nums">
                      Daily
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight">
                        <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Daily Rosary
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{dailyTemplate.name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        aria-label="Begin Daily Rosary"
                        className="p-1.5 text-primary hover:opacity-80"
                        onClick={beginDailyRosary}
                      >
                        <Play className="size-4" />
                      </button>
                    </div>
                  </li>
                </ul>
              </section>
            ) : null}

            {openSessions.length > 0 ? (
              <section>
                <p className="eyebrow mb-2">In progress</p>
                <ul className="space-y-2">
                  {openSessions.map((s) => (
                    <li key={s.id} className="soft-card flex items-center">
                      <Link
                        to="/session/$sessionId"
                        params={{ sessionId: s.id }}
                        className="flex-1 p-4"
                      >
                        <p className="font-medium">{s.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(s.created_at).toLocaleString()}
                        </p>
                      </Link>
                      <button
                        type="button"
                        aria-label="Delete session"
                        className="px-4 py-5 text-muted-foreground"
                        onClick={() => deleteSession(s.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {plans.length > 0 ? (
              <section>
                <p className="eyebrow mb-2">Upcoming</p>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {plans.map((plan) => {
                    const tpl = db.templates.find((t) => t.id === plan.template_id);
                    const title = planTitle(db, plan);
                    // While this novena stands in for the Daily Rosary, its row wears
                    // the DAILY ROSARY label and shows "Day X of N" for today.
                    const isDailyFulfiller = plan.id === dailyFulfiller?.id;
                    const occ = isDailyFulfiller
                      ? occurrenceInfo(plan.starts_on ?? plan.date ?? today, plan.recurrence, today)
                      : null;
                    const dayLabel = occ?.total ? `Day ${occ.index} of ${occ.total}` : null;
                    const dateLabel = plan.date
                      ? new Date(`${plan.date}T00:00`).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Any time";
                    const sub = [
                      dayLabel,
                      plan.purpose ? tpl?.name : null,
                      plan.recurrence.freq !== "none" ? recurrenceLabel(plan.recurrence) : null,
                      plan.start_time ? plan.start_time : null,
                      plan.hour ? HOUR_LABEL[plan.hour] : null,
                      plan.duration_min ? `~${plan.duration_min} min` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={plan.id} className="flex items-center gap-3 px-3 py-2.5">
                        <span className="w-12 shrink-0 text-xs font-semibold text-primary tabular-nums">
                          {isDailyFulfiller ? "Daily" : dateLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-tight">
                            {isDailyFulfiller ? (
                              <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Daily Rosary
                              </span>
                            ) : null}
                            {title}
                          </p>
                          {sub ? (
                            <p className="truncate text-xs text-muted-foreground">{sub}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <PlanShareButton db={db} plan={plan} today={today} />
                          <button
                            type="button"
                            aria-label="Edit session"
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              loadPlan(plan);
                              setTab("builder");
                            }}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Duplicate session"
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                            onClick={() => duplicatePlan(plan)}
                          >
                            <Copy className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete session"
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteSessionPlan(plan.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Begin session"
                            className="p-1.5 text-primary hover:opacity-80"
                            onClick={() => beginPlan(plan)}
                          >
                            <Play className="size-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {completedSessions.length > 0 ? (
              <section>
                <p className="eyebrow mb-2">Completed</p>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {completedSessions.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                        {new Date(s.completed_at!).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">{s.title}</p>
                      <button
                        type="button"
                        aria-label="Delete session"
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSession(s.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {openSessions.length + plans.length + completedSessions.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No sessions yet. Build one in the Session Builder tab.
              </p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
