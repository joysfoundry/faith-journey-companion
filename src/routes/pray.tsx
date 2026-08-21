import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FilePlus2, MoreVertical, Pencil, Play, Plus, Save, Trash2, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevotionItemsEditor } from "@/components/prayer/DevotionItemsEditor";
import { useApp } from "@/lib/prayer/store";
import { listenSourcesFromItems, newId, resolveNovenaDay, todayISO } from "@/lib/prayer/compiler";
import type {
  MysteryPresentation,
  PrayerHour,
  PrayerTemplate,
  ProgressMode,
  Recurrence,
  SessionContext,
  SessionPlan,
  TemplateItem,
} from "@/lib/prayer/types";

export const Route = createFileRoute("/pray")({
  head: () => ({
    meta: [
      { title: "Prayer Sessions — Faith Journey" },
      {
        name: "description",
        content:
          "Build prayer sessions and see what's upcoming and completed — start from a devotion or from scratch, add prayers and petitions, set how you listen and when to pray it.",
      },
      { property: "og:title", content: "Prayer Sessions — Faith Journey" },
      {
        property: "og:description",
        content:
          "Start from a devotion or add prayers freely — sessions expand into a full prayer.",
      },
    ],
  }),
  component: PrayPage,
});

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: "Once",
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
  custom: "Custom",
};

const HOUR_LABEL: Record<PrayerHour, string> = {
  office_of_readings: "Office of Readings",
  lauds: "Morning Prayer (Lauds)",
  daytime: "Daytime Prayer",
  vespers: "Evening Prayer (Vespers)",
  compline: "Night Prayer (Compline)",
};

function PrayPage() {
  const {
    db,
    ready,
    startBuiltSession,
    deleteSession,
    saveSessionPlan,
    deleteSessionPlan,
    saveTemplate,
  } = useApp();
  const navigate = useNavigate();
  const today = todayISO();

  const seedItems = (tid: string): TemplateItem[] =>
    db.template_items
      .filter((i) => i.template_id === tid)
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i }));

  const [tab, setTab] = useState<"builder" | "sessions">("builder");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [dateVal, setDateVal] = useState(today);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [recurrenceNote, setRecurrenceNote] = useState("");
  const [hour, setHour] = useState<PrayerHour | "">("");
  const [durationMin, setDurationMin] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [originIds, setOriginIds] = useState<Set<string>>(new Set());
  const [progressMode, setProgressMode] = useState<ProgressMode>("scroll");
  const [mysterySet, setMysterySet] = useState("auto");
  const [presentation, setPresentation] = useState<MysteryPresentation | "template">("template");
  const [listenIndex, setListenIndex] = useState("");
  const [novenaInstanceId, setNovenaInstanceId] = useState("");

  const baseTemplate = templateId ? db.templates.find((t) => t.id === templateId) : undefined;
  const isNovena = baseTemplate?.kind === "novena";
  const novenaInstances = db.novena_instances.filter((n) => n.template_id === templateId);
  const mysteryCount = items.filter((i) => i.kind === "mystery_placeholder").length;
  const sources = listenSourcesFromItems(db, items, baseTemplate?.media ?? []);
  const chosenSource = sources[Number(listenIndex)];

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    setItems(id ? seedItems(id) : []);
    setOriginIds(new Set(id ? seedItems(id).map((i) => i.id) : []));
    setListenIndex("");
    setMysterySet("auto");
    setPresentation("template");
    setNovenaInstanceId("");
  };

  const resetForm = () => {
    setEditingId(null);
    setPurpose("");
    setDateVal(today);
    setRecurrence("none");
    setRecurrenceNote("");
    setHour("");
    setDurationMin("");
    setProgressMode("scroll");
    pickTemplate("");
  };

  const loadPlan = (plan: SessionPlan) => {
    setEditingId(plan.id);
    setPurpose(plan.purpose ?? "");
    setDateVal(plan.date ?? today);
    setRecurrence(plan.recurrence);
    setRecurrenceNote(plan.recurrence_note ?? "");
    setHour(plan.hour ?? "");
    setDurationMin(plan.duration_min != null ? String(plan.duration_min) : "");
    setTemplateId(plan.template_id);
    const planItems = plan.items ?? seedItems(plan.template_id);
    setItems(planItems.map((i) => ({ ...i })));
    setOriginIds(new Set(seedItems(plan.template_id).map((i) => i.id)));
    setProgressMode(plan.context.progress_mode ?? "scroll");
    setMysterySet(plan.context.mystery_set_id ?? "auto");
    setPresentation(plan.context.mystery_presentation ?? "template");
    setNovenaInstanceId(plan.context.novena_instance_id ?? "");
    const srcs = listenSourcesFromItems(
      db,
      planItems,
      (plan.template_id ? db.templates.find((t) => t.id === plan.template_id)?.media : []) ?? [],
    );
    const idx = srcs.findIndex((s) => s.url === plan.context.listen_source?.url);
    setListenIndex(idx >= 0 ? String(idx) : "");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildContext = (): Partial<SessionContext> => ({
    progress_mode: progressMode,
    ...(mysterySet !== "auto" ? { mystery_set_id: mysterySet } : {}),
    ...(presentation !== "template" ? { mystery_presentation: presentation } : {}),
    ...(isNovena && novenaInstanceId ? { novena_instance_id: novenaInstanceId } : {}),
    ...(chosenSource ? { listen_source: chosenSource, audio_enabled: true } : {}),
  });

  const saveSession = () => {
    if (items.length === 0) {
      toast.error("Add at least one prayer to the session.");
      return;
    }
    const plan: SessionPlan = {
      id: editingId ?? newId("plan"),
      template_id: templateId,
      ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
      ...(dateVal ? { date: dateVal } : {}),
      recurrence,
      ...(recurrence === "custom" && recurrenceNote.trim()
        ? { recurrence_note: recurrenceNote.trim() }
        : {}),
      ...(hour ? { hour } : {}),
      ...(durationMin && Number(durationMin) > 0 ? { duration_min: Number(durationMin) } : {}),
      context: buildContext(),
      items: items.map((it, i) => ({ ...it, position: i })),
      created_at:
        (editingId && db.session_plans.find((p) => p.id === editingId)?.created_at) ||
        new Date().toISOString(),
    };
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
    );
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
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
    <AppShell title="Prayer Sessions" action={tab === "builder" ? pageMenu : undefined}>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "builder" | "sessions")}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="builder">Session Builder</TabsTrigger>
          <TabsTrigger value="sessions">
            Sessions
            {plans.length + openSessions.length > 0 ? (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {plans.length + openSessions.length}
              </span>
            ) : null}
          </TabsTrigger>
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
                  this session without changing the template.
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
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <select
                    id="recurrence"
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                    className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                  >
                    {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                      <option key={r} value={r}>
                        {RECURRENCE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {recurrence === "custom" ? (
                <div>
                  <Label htmlFor="recurrence-note">Custom recurrence</Label>
                  <Input
                    id="recurrence-note"
                    value={recurrenceNote}
                    placeholder="e.g. every 1st Friday, Mon/Wed/Fri…"
                    onChange={(e) => setRecurrenceNote(e.target.value)}
                    className="mt-2"
                  />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hour">Hour (optional)</Label>
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
                  <Label htmlFor="duration">Est. time (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={durationMin}
                    placeholder="e.g. 20"
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {isNovena ? (
              <div className="soft-card p-4">
                <Label htmlFor="novena">Novena</Label>
                <select
                  id="novena"
                  value={novenaInstanceId}
                  onChange={(e) => setNovenaInstanceId(e.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
                >
                  <option value="">Not tracking a novena</option>
                  {novenaInstances.map((n) => {
                    const res = baseTemplate ? resolveNovenaDay(baseTemplate, n, today) : undefined;
                    return (
                      <option key={n.id} value={n.id}>
                        {n.name}
                        {res ? ` — Day ${res.day}${res.phase ? ` (${res.phase.name})` : ""}` : ""}
                      </option>
                    );
                  })}
                </select>
                <Link to="/novenas" className="mt-2 inline-block text-sm underline">
                  Manage novenas
                </Link>
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
                    const title = plan.purpose || tpl?.name || "Session";
                    const dateLabel = plan.date
                      ? new Date(`${plan.date}T00:00`).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Any time";
                    const sub = [
                      plan.purpose ? tpl?.name : null,
                      plan.recurrence !== "none" ? RECURRENCE_LABEL[plan.recurrence] : null,
                      plan.hour ? HOUR_LABEL[plan.hour] : null,
                      plan.duration_min ? `${plan.duration_min} min` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={plan.id} className="flex items-center gap-3 px-3 py-2.5">
                        <span className="w-12 shrink-0 text-xs font-semibold text-primary tabular-nums">
                          {dateLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-tight">{title}</p>
                          {sub ? (
                            <p className="truncate text-xs text-muted-foreground">{sub}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
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
