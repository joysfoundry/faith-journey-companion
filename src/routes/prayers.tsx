import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/prayer/store";
import { toast } from "sonner";
import { templateOutline } from "@/lib/prayer/compiler";
import { TAXONOMY_LABELS } from "@/domain/taxonomy";

export const Route = createFileRoute("/prayers")({
  head: () => ({
    meta: [
      { title: "Prayer Library — Faith Journey" },
      {
        name: "description",
        content:
          "Browse, search, and edit single prayers, devotions, and How To guides in one library.",
      },
      { property: "og:title", content: "Prayer Library — Faith Journey" },
      {
        property: "og:description",
        content: "Your prayers, devotions, and instructions, kept together and ready to pray.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { db, toggleFavorite, deletePrayer, deleteTemplate, deleteHowTo } = useApp();
  const [query, setQuery] = useState("");

  const prayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.prayers
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.includes(q)) ||
          (p.prayer_type ?? "").includes(q) ||
          (db.prayer_versions.find((v) => v.id === p.default_version_id)?.body ?? "")
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.title.localeCompare(b.title));
  }, [db, query]);

  return (
    <AppShell
      title="Prayers"
      subtitle="Single prayers, devotions, and how to pray them"
    >
      <Tabs defaultValue="prayers">
        <TabsList className="w-full">
          <TabsTrigger value="prayers" className="flex-1">
            Prayers
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">
            Devotions
          </TabsTrigger>
          <TabsTrigger value="howto" className="flex-1">
            How To
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prayers" className="mt-4">
          <Button asChild variant="secondary" className="mb-3 h-12 w-full">
            <Link to="/import">
              <Plus className="size-4" /> New prayer
            </Link>
          </Button>
          <p className="mb-3 text-center text-xs text-muted-foreground">
            Write it, paste it, or add a link to import from.
          </p>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prayers"
              className="h-12 pl-9"
              aria-label="Search prayers"
            />
          </div>
          <ul className="space-y-3">
            {prayers.map((prayer) => {
              const versions = db.prayer_versions.filter((v) => v.prayer_id === prayer.id);
              return (
                <li key={prayer.id} className="soft-card flex items-center">
                  <Link
                    to="/prayer/$prayerId"
                    params={{ prayerId: prayer.id }}
                    className="flex-1 p-4"
                  >
                    <p className="font-medium">{prayer.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {versions.length} version{versions.length === 1 ? "" : "s"} ·{" "}
                      {TAXONOMY_LABELS[prayer.prayer_type]}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(prayer.id)}
                    aria-label={prayer.favorite ? "Remove favorite" : "Add favorite"}
                    className="px-4 py-5 text-muted-foreground"
                  >
                    <Heart
                      className={`size-5 ${prayer.favorite ? "fill-primary text-primary" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`Delete “${prayer.title}”?`)) return;
                      deletePrayer(prayer.id);
                      toast.success("Prayer deleted");
                    }}
                    aria-label={`Delete ${prayer.title}`}
                    className="pr-4 py-5 text-muted-foreground"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </li>
              );
            })}
            {prayers.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No prayers match that search.
              </li>
            ) : null}
          </ul>
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-3">
          <Button asChild variant="secondary" className="h-12 w-full">
            <Link to="/import" search={{ mode: "devotion" }}>
              <Plus className="size-4" /> New devotion
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Paste or write the devotion — each prayer is saved on its own, then bundled.{" "}
            <Link
              to="/template/$templateId"
              params={{ templateId: "new" }}
              className="text-primary underline"
            >
              Build one by hand
            </Link>
          </p>
          {db.templates.map((template) => {
            const outline = templateOutline(db, template);
            return (
              <div key={template.id} className="soft-card flex items-start">
              <Link
                to="/template/$templateId"
                params={{ templateId: template.id }}
                className="block flex-1 p-4"
              >
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground">
                  {template.description ?? `${outline.length} items`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {outline
                    .slice(0, 4)
                    .map((o) => `${o.label}${o.detail ? ` ${o.detail}` : ""}`)
                    .join(" · ")}
                  {outline.length > 4 ? " …" : ""}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`Delete devotion “${template.name}”?`)) return;
                  deleteTemplate(template.id);
                  toast.success("Devotion deleted");
                }}
                aria-label={`Delete ${template.name}`}
                className="px-4 py-5 text-muted-foreground"
              >
                <Trash2 className="size-5" />
              </button>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="howto" className="mt-4 space-y-3">
          {db.how_tos.map((howTo) => {
            const linked = db.templates.find((t) => t.id === howTo.template_id);
            return (
              <div key={howTo.id} className="soft-card flex items-start">
                <Link
                  to="/howto/$howToId"
                  params={{ howToId: howTo.id }}
                  className="block flex-1 p-4"
                >
                  <p className="font-medium">{howTo.title}</p>
                  <p className="text-sm text-muted-foreground">{howTo.summary}</p>
                  {linked ? (
                    <p className="mt-1 text-xs text-primary">For {linked.name}</p>
                  ) : null}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Delete guide “${howTo.title}”?`)) return;
                    deleteHowTo(howTo.id);
                    toast.success("Guide deleted");
                  }}
                  aria-label={`Delete ${howTo.title}`}
                  className="px-4 py-5 text-muted-foreground"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
