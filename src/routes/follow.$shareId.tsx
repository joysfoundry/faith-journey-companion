/**
 * Guest "follow-along" — the short, **titled** link (`/follow/aug-28-litany-…`),
 * ACTS-94 step 1. Fetches the stored session from Supabase by slug and renders the
 * same shared FollowAlongView. Fetch is client-only (browser Supabase client), so
 * the first paint is a neutral loading state.
 */
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { FollowAlongMessage, FollowAlongView } from "@/components/prayer/FollowAlongView";
import { fetchShare } from "@/lib/prayer/shareStore";
import type { SharePayload } from "@/lib/prayer/share";

export const Route = createFileRoute("/follow/$shareId")({
  head: () => ({
    meta: [
      { title: "Follow along — Faith Journey" },
      {
        name: "description",
        content: "Follow along with a shared prayer session — every prayer, in order.",
      },
      { property: "og:title", content: "Follow along — Faith Journey" },
      {
        property: "og:description",
        content: "A shared prayer session to pray along with — no app needed.",
      },
    ],
  }),
  component: FollowAlongShared,
});

type FetchState =
  { status: "loading" } | { status: "missing" } | { status: "ready"; payload: SharePayload };

function FollowAlongShared() {
  const { shareId } = Route.useParams();
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchShare(shareId)
      .then((payload) => {
        if (cancelled) return;
        setState(payload ? { status: "ready", payload } : { status: "missing" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  if (state.status === "loading") {
    return <FollowAlongMessage>Loading the prayers…</FollowAlongMessage>;
  }
  if (state.status === "missing") {
    return (
      <FollowAlongMessage>
        <h1 className="font-display text-2xl">This link isn't available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find a prayer session for this link — it may be mistyped or no longer shared.
          Ask the host to send it again.
        </p>
      </FollowAlongMessage>
    );
  }

  return <FollowAlongView payload={state.payload} slug={shareId} />;
}
