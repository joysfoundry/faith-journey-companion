import { createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronRight, Images } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  galleryPlaceholder,
  inProgressItems,
  recentReflections,
  todaySessions,
} from "@/domain/placeholderData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faith Journey — Your daily prayer companion" },
      {
        name: "description",
        content:
          "Plan, pray, and reflect: rosaries, novenas, and chaplets in one calm daily companion with reflections and photos.",
      },
      { property: "og:title", content: "Faith Journey — Your daily prayer companion" },
      {
        property: "og:description",
        content:
          "Plan, pray, and reflect: rosaries, novenas, and chaplets in one calm daily companion.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Today</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-foreground">
          Come, let us pray.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Two prayer sessions are waiting. Begin whenever you are ready.
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="font-display text-xl text-foreground">Prayer sessions</h2>
        {todaySessions.map((session) => (
          <Card key={session.id} className="border-border/70 shadow-devotional">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xl font-normal">{session.title}</CardTitle>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {session.scheduledFor} · {session.subtitle}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Progress value={(session.completedCount / session.itemCount) * 100} />
                <p className="text-xs text-muted-foreground">
                  {session.completedCount} of {session.itemCount} prayers marked done
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">
                  {session.status === "in_progress" ? "Continue" : "Start"}
                </Button>
                <Button size="sm" variant="outline" disabled title="Coming in a later phase">
                  <Camera className="size-4" aria-hidden />
                  Add photo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-xl text-foreground">In progress</h2>
        <Card className="border-border/70">
          <CardContent className="divide-y divide-border/70 p-0">
            {inProgressItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-xl text-foreground">Reflections</h2>
        <div className="space-y-3">
          {recentReflections.map((reflection) => (
            <Card key={reflection.id} className="border-border/70">
              <CardContent className="space-y-3 py-5">
                <p className="text-sm font-medium text-foreground">{reflection.title}</p>
                <p className="text-sm text-muted-foreground">{reflection.body}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled title="Coming in a later phase">
                    <Camera className="size-4" aria-hidden />
                    Add photo
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {reflection.photoIds.length} photos
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-foreground">Gallery</h2>
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <Images className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {galleryPlaceholder.length === 0
                ? "Photos you add during prayer or reflection will gather here."
                : `${galleryPlaceholder.length} photos`}
            </p>
            <p className="text-xs text-muted-foreground/80">Placeholder for MVP</p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
