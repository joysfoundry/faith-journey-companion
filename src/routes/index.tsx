import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Mic,
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { PrayerSearch } from "@/components/home/PrayerSearch";
import { ReflectionComposer } from "@/components/home/ReflectionComposer";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  learnItems,
  readingPrograms,
  todaysReflections,
  todaysWord,
  type LinkableItem,
} from "@/domain/placeholderData";
import { defaultContext, resolveMysterySet, todayISO } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";



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

function SectionHeading({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl text-foreground">{children}</h2>
      {action}
    </div>
  );
}

function Index() {
  const { db, startSession } = useApp();
  const navigate = useNavigate();
  const today = todayISO();
  const [massOpen, setMassOpen] = useState(false);
  const [journalLinkId, setJournalLinkId] = useState<string | null>(null);

  const setId = resolveMysterySet(db, defaultContext({ date: today }));
  const setName = db.mystery_sets.find((s) => s.id === setId)?.name ?? "Mysteries";
  const rosary = db.templates.find((t) => t.id === "tpl-rosary") ?? db.templates[0];
  const openSessions = db.sessions.filter((s) => !s.completed_at);

  function openJournal(linkId: string) {
    setJournalLinkId(linkId);
    document.getElementById("reflection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function begin() {
    if (!rosary) return;
    const session = startSession(rosary.id, { date: today, progress_mode: "scroll" });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  }

  const linkables: LinkableItem[] = [
    { id: rosary?.id ?? "rosary", label: `Daily Rosary · ${setName}`, group: "Prayer & devotion" },
    { id: todaysWord.id, label: todaysWord.liturgicalTitle, group: "Word" },
    ...learnItems.map((l) => ({ id: l.id, label: l.title, group: "Formation" })),
  ];

  return (
    <AppShell>
      <section className="mb-8">
        <h1 className="font-display text-3xl leading-tight text-foreground">Come, let us pray.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your devotion, the Word, and what is forming you today.
        </p>
      </section>

      {/* A — Prayer & Devotion: today's session + prayer search */}
      <section className="mb-9">
        <SectionHeading
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/pray">
                <Plus className="size-4" aria-hidden />
                Session
              </Link>
            </Button>
          }
        >
          Prayer &amp; Devotion
        </SectionHeading>

        <Card className="border-border/70 shadow-devotional">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="font-display text-xl font-normal">
                Daily Rosary · {setName} Mysteries
              </CardTitle>
              <Badge variant="secondary" className="font-normal">
                Standard
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {rosary?.name ?? "Rosary template"} · prepared in order, nothing to count
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={begin}>
                <Sparkles className="size-4" aria-hidden />
                Begin prayer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openJournal(rosary?.id ?? "rosary")}
                aria-label="Write a reflection about today's Rosary"
              >
                <NotebookPen className="size-4" aria-hidden />
                Reflect
              </Button>
            </div>
          </CardContent>
        </Card>

        {openSessions.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {openSessions.map((session) => (
              <li key={session.id}>
                <Link
                  to="/session/$sessionId"
                  params={{ sessionId: session.id }}
                  className="soft-card flex items-center justify-between p-4"
                >
                  <span>
                    <span className="eyebrow block">Continue</span>
                    <span className="font-display text-lg">{session.title}</span>
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4">
          <h3 className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Pray something else
          </h3>
          <PrayerSearch />
        </div>
      </section>



      {/* C — Word */}
      <section className="mb-9">
        <SectionHeading>Word</SectionHeading>
        <div className="space-y-3">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg font-normal">
                {todaysWord.liturgicalTitle}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {todaysWord.readings.join(" · ")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href={todaysWord.readingsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  Read today's Mass readings
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openJournal(todaysWord.id)}
                  aria-label="Write a reflection about today's readings"
                >
                  <NotebookPen className="size-4" aria-hidden />
                  Reflect
                </Button>
              </div>

              <Collapsible open={massOpen} onOpenChange={setMassOpen}>
                <CollapsibleTrigger className="flex w-full items-center gap-1.5 border-t border-border/60 pt-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground">
                  Mass (if applicable)
                  <ChevronDown
                    className={`size-3.5 shrink-0 transition-transform ${
                      massOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2.5 pt-3">
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="mass-church" className="text-xs text-muted-foreground">
                        Church
                      </Label>
                      <Input id="mass-church" className="h-9" placeholder="Where did you attend?" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mass-priest" className="text-xs text-muted-foreground">
                        Priest
                      </Label>
                      <Input id="mass-priest" className="h-9" placeholder="Who celebrated?" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Mic className="size-4" aria-hidden />
                      Homily audio
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="size-4" aria-hidden />
                      Homily transcript
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>


            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="divide-y divide-border/70 p-0">
              {readingPrograms.map((program) => (
                <a
                  key={program.id}
                  href={program.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-5 py-4 hover:bg-accent/40"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{program.title}</p>
                    <p className="text-xs text-muted-foreground">{program.detail}</p>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
                </a>
              ))}
              <div className="px-5 py-3">
                <Button size="sm" variant="ghost">
                  <Plus className="size-4" aria-hidden />
                  Add a reading program
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* D — Learn */}
      <section className="mb-9">
        <SectionHeading
          action={
            <Button size="sm" variant="ghost">
              <Plus className="size-4" aria-hidden />
              Add item
            </Button>
          }
        >
          Library

        </SectionHeading>
        <Card className="border-border/70">
          <CardContent className="divide-y divide-border/70 p-0">
            {learnItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {CONTENT_TYPE_LABELS[item.contentType]}
                    {item.creator ? ` · ${item.creator}` : ""}
                    {item.source ? ` · ${item.source}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openJournal(item.id)}
                    aria-label={`Write a reflection about ${item.title}`}
                  >
                    <NotebookPen className="size-4" aria-hidden />
                    Reflect
                  </Button>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-xs text-muted-foreground">
                Books, articles, videos, sermons, shows
              </span>
              <Button size="sm" variant="ghost">
                <BookOpen className="size-4" aria-hidden />
                Finished list
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reflection / Journal */}
      <section id="reflection">
        <SectionHeading>Reflection</SectionHeading>
        <ReflectionComposer
          linkables={linkables}
          entries={todaysReflections}
          prefillLinkId={journalLinkId}
        />
      </section>
    </AppShell>
  );
}
