import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Mic,
  NotebookPen,
  Plus,
} from "lucide-react";
import { useState } from "react";

import { AddSessionDialog } from "@/components/home/AddSessionDialog";
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
import { defaultDailyRosarySession } from "@/domain/dailyRosary";
import {
  learnItems,
  plannedSessions,
  readingPrograms,
  todaysReflections,
  todaysWord,
  type LinkableItem,
} from "@/domain/placeholderData";


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
  const today = new Date();
  const sessions =
    plannedSessions.length > 0 ? plannedSessions : [defaultDailyRosarySession(today)];
  const [massOpen, setMassOpen] = useState(false);
  const [journalLinkId, setJournalLinkId] = useState<string | null>(null);

  function openJournal(linkId: string) {
    setJournalLinkId(linkId);
    document.getElementById("reflection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const linkables: LinkableItem[] = [
    ...sessions.map((s) => ({ id: s.id, label: s.title, group: "Prayer & devotion" })),
    { id: todaysWord.id, label: todaysWord.liturgicalTitle, group: "Word" },
    ...learnItems.map((l) => ({ id: l.id, label: l.title, group: "Library" })),
  ];


  return (
    <AppShell>
      <section className="mb-8">
        <h1 className="font-display text-3xl leading-tight text-foreground">Come, let us pray.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your devotion, your need, the Word, and what you're learning today.
        </p>
      </section>

      {/* A — Prayer & Devotion: today's sessions + prayer search */}
      <section className="mb-9">
        <SectionHeading action={<AddSessionDialog />}>Prayer &amp; Devotion</SectionHeading>
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="border-border/70 shadow-devotional">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-display text-xl font-normal">
                    {session.title}
                    {session.mystery ? ` · ${session.mystery} Mysteries` : ""}
                  </CardTitle>
                  {session.isDefault && (
                    <Badge variant="secondary" className="font-normal">
                      Standard
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{session.templateTitle}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">{session.completedCount > 0 ? "Continue" : "Start"}</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openJournal(session.id)}
                    aria-label={`Write a reflection about ${session.title}`}
                  >
                    <NotebookPen className="size-4" aria-hidden />
                    Reflect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
            <CardContent className="space-y-4">
              <a
                href={todaysWord.readingsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
              >
                Read today's Mass readings
                <ExternalLink className="size-3.5" aria-hidden />
              </a>

              <Collapsible
                open={massOpen}
                onOpenChange={setMassOpen}
                className="rounded-lg border border-border/70 bg-muted/40"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <span className="font-display text-base text-foreground">
                    Mass (if applicable)
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                      massOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 px-4 pb-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="mass-church" className="text-xs text-muted-foreground">
                        Church
                      </Label>
                      <Input id="mass-church" placeholder="Where did you attend?" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mass-priest" className="text-xs text-muted-foreground">
                        Priest
                      </Label>
                      <Input id="mass-priest" placeholder="Who celebrated?" />
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => openJournal(todaysWord.id)}
                      aria-label="Write a reflection about today's Mass"
                    >
                      <NotebookPen className="size-4" aria-hidden />
                      Reflect
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
          Learn
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
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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
