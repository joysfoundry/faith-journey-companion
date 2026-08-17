import { ChevronDown, FileText, Mic, NotebookPen, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readingPrograms, todaysWord, type ReadingProgram } from "@/domain/placeholderData";

/** Word: today's Mass readings plus the reading programs you follow. */
export function WordSection({ onReflect }: { onReflect: (linkId: string) => void }) {
  const [massOpen, setMassOpen] = useState(false);
  const [programs, setPrograms] = useState<ReadingProgram[]>(readingPrograms);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function addProgram() {
    if (!title.trim()) return;
    setPrograms((prev) => [
      ...prev,
      {
        id: `program-${prev.length + 1}`,
        title: title.trim(),
        detail: "Added by you",
        url: url.trim(),
      },
    ]);
    setTitle("");
    setUrl("");
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="font-display text-lg font-normal">
                {todaysWord.liturgicalTitle}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {todaysWord.readings.join(" · ")}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => onReflect(todaysWord.id)}
              aria-label="Write a reflection about today's readings"
            >
              <NotebookPen className="size-4" aria-hidden />
              Reflect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href={todaysWord.readingsUrl}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm text-primary underline-offset-4 hover:underline"
          >
            {todaysWord.readingsUrl}
          </a>

          <Collapsible open={massOpen} onOpenChange={setMassOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-1.5 border-t border-border/60 pt-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground">
              Mass (if applicable)
              <ChevronDown
                className={`size-3.5 shrink-0 transition-transform ${massOpen ? "rotate-180" : ""}`}
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

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Reading programs
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" aria-hidden />
          Add program
        </Button>
      </div>

      {adding ? (
        <div className="soft-card space-y-2.5 p-4">
          <div className="space-y-1">
            <Label htmlFor="program-title" className="text-xs text-muted-foreground">
              Title
            </Label>
            <Input
              id="program-title"
              className="h-9"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bible in a Year"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="program-url" className="text-xs text-muted-foreground">
              Source (URL)
            </Label>
            <Input
              id="program-url"
              className="h-9"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={addProgram}>
              Save program
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <ul className="space-y-2">
        {programs.map((program) => (
          <li key={program.id} className="soft-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{program.title}</p>
                <p className="truncate text-sm text-muted-foreground">{program.detail}</p>
                {program.url ? (
                  <a
                    href={program.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-xs text-primary underline-offset-4 hover:underline"
                  >
                    {program.url}
                  </a>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReflect(program.id)}
                  aria-label={`Write a reflection about ${program.title}`}
                >
                  <NotebookPen className="size-4" aria-hidden />
                  Reflect
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
