import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/prayer/store";

/** Minimal prayer-library search: type, see matches, open one. */
export function PrayerSearch() {
  const { db } = useApp();
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return db.prayers
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.includes(q),
      )
      .slice(0, 6);
  }, [db.prayers, query]);

  return (
    <div className="rounded-lg border border-border/70 bg-muted/30">
      <div className="flex items-center gap-2 px-3 py-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search prayers — Memorare, healing, St. Michael…"
          aria-label="Search the prayer library"
          className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      {query.trim() && (
        <ul className="divide-y divide-border/70 border-t border-border/70">
          {matches.length > 0 ? (
            matches.map((prayer) => (
              <li key={prayer.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{prayer.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[prayer.category, ...prayer.tags].join(" · ")}
                  </p>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/prayer/$prayerId" params={{ prayerId: prayer.id }}>
                    Open
                  </Link>
                </Button>
              </li>
            ))
          ) : (
            <li className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-xs text-muted-foreground">No prayer found.</span>
              <Button asChild size="sm" variant="ghost">
                <Link to="/import">
                  Add prayer
                </Link>
              </Button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
