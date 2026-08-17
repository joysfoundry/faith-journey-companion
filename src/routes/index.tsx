import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Heart,
  Mic,
  Plus,
  Sun,
} from "lucide-react";
import { useState } from "react";

import { AddSessionDialog } from "@/components/home/AddSessionDialog";
import { ReflectionComposer } from "@/components/home/ReflectionComposer";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { defaultDailyRosarySession } from "@/domain/dailyRosary";
import {
  currentNeed,
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
  const [journalPromptFor, setJournalPromptFor] = useState<string | null>(null);

  const linkables: LinkableItem[] = [
    ...sessions.map((s) => ({ id: s.id, label: s.title, group: "Prayer & devotion" })),
    ...(currentNeed ? [{ id: currentNeed.id, label: currentNeed.need, group: "Need" }] : []),
    { id: todaysWord.id, label: todaysWord.liturgicalTitle, group: "Word" },
    ...learnItems.map((l) => ({ id: l.id, label: l.title, group: "Learn" })),
  ];

  return (
    <AppShell>
      <section className="mb-8">
        <h1 className="font-display text-3xl leading-tight text-foreground">Come, let us pray.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your devotion, your need, the Word, and what you're learning today.
        </p>
      </section>

      {/* A — Prayer or Devotion */}
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
      </section>

      {/* B — Need */}
      <section className="mb-9">
        <SectionHeading
          action={
            <Button size="sm" variant="ghost">
              <Plus className="size-4" aria-hidden />
              Add need
            </Button>
          }
        >
          Need
        </SectionHeading>
        <Card className="border-border/70">
          <CardContent className="space-y-3 py-5">
            {currentNeed ? (
              <>
                <div className="flex items-start gap-3">
                  <Heart className="mt-0.5 size-4 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">{currentNeed.need}</p>
                    <p className="text-xs text-muted-foreground">
                      Suggested prayer · {currentNeed.prayerTitle}
                    </p>
                  </div>
                </div>
                <Button size="sm">Pray now</Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">What's on your heart today?</p>
            )}
          </CardContent>
        </Card>
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

              <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
                <p className="text-sm text-foreground">Did you hear these at Mass?</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline">
                    Yes
                  </Button>
                  <Button size="sm" variant="ghost">
                    No
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <Plus className="size-4" aria-hidden />
                    Church
                  </Button>
                  <Button size="sm" variant="outline">
                    <Plus className="size-4" aria-hidden />
                    Priest
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mic className="size-4" aria-hidden />
                    Homily notes, audio or transcript
                  </Button>
                </div>
              </div>
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
      <section>
        <SectionHeading>Reflection</SectionHeading>
        <ReflectionComposer linkables={linkables} entries={todaysReflections} />
      </section>

      <Dialog
        open={journalPromptFor !== null}
        onOpenChange={(open) => !open && setJournalPromptFor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">
              <Sun className="mr-2 inline size-5 text-gold" aria-hidden />
              Add a journal entry?
            </DialogTitle>
            <DialogDescription>
              {journalPromptFor} is complete. Would you like to write a reflection while it's fresh?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setJournalPromptFor(null)}>
              No
            </Button>
            <Button variant="outline" onClick={() => setJournalPromptFor(null)}>
              Later
            </Button>
            <Button onClick={() => setJournalPromptFor(null)}>Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
