/**
 * Guest "follow-along" — the **fragment** link (`/follow#<payload>`), a fully
 * self-contained, no-backend share. Decodes the payload from the URL fragment on
 * the client (re-reading on hashchange) and renders the shared FollowAlongView.
 *
 * The short/titled backend link lives at `/follow/$shareId`; this fragment route
 * is the offline / no-backend fallback. Both sit under the `follow` layout.
 */
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { FollowAlongMessage, FollowAlongView } from "@/components/prayer/FollowAlongView";
import { decodeShare, type SharePayload } from "@/lib/prayer/share";

export const Route = createFileRoute("/follow/")({
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
  component: FollowAlong,
});

type DecodeState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ready"; payload: SharePayload };

/** Read + decode the URL fragment on the client only; re-read if the hash changes. */
function useFragmentSession(): DecodeState {
  const [state, setState] = useState<DecodeState>({ status: "loading" });
  useEffect(() => {
    const read = () => {
      // Strip the leading '#'. Everything after it is the compressed payload.
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) {
        setState({ status: "empty" });
        return;
      }
      const payload = decodeShare(raw);
      setState(payload ? { status: "ready", payload } : { status: "invalid" });
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return state;
}

function FollowAlong() {
  const state = useFragmentSession();

  if (state.status === "loading") {
    return <FollowAlongMessage>Loading the prayers…</FollowAlongMessage>;
  }
  if (state.status === "empty") {
    return (
      <FollowAlongMessage>
        <h1 className="font-display text-2xl">Nothing to follow yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page opens a shared prayer session. Ask the host to send you the full link.
        </p>
      </FollowAlongMessage>
    );
  }
  if (state.status === "invalid") {
    return (
      <FollowAlongMessage>
        <h1 className="font-display text-2xl">This link looks incomplete</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The prayers couldn't be read from this link — it may have been cut off. Ask the host to
          reshare the whole link.
        </p>
      </FollowAlongMessage>
    );
  }

  return <FollowAlongView payload={state.payload} />;
}
