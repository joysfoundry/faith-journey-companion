/**
 * Share a compiled session as a guest "follow-along" link (ACTS-94).
 *
 * Produces a **short, titled** link (`<origin>/follow/aug-28-litany-…`) by saving
 * the compressed session to the backend (`createShare`) and using the returned
 * slug. If the backend is unreachable (e.g. the table isn't set up yet), it falls
 * back to the self-contained **fragment** link so sharing still works offline.
 *
 * Serves two callers:
 *  - the **leader** (`allowEditCover`) types an optional intention/welcome note,
 *    then creates the link; and
 *  - a **guest** re-sharing (`existingSlug`) hands off the *same* short link —
 *    identity-free, so leadership passes on with the link.
 *
 * A QR is shown whenever the link fits (short links always do; a fallback fragment
 * only for short sessions).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { encodeShare, QR_FRAGMENT_LIMIT, type SharePayload } from "@/lib/prayer/share";
import { createShare } from "@/lib/prayer/shareStore";

/** Fold blank cover text away so it doesn't bloat the payload. */
function withCover(payload: SharePayload, purpose: string, info: string): SharePayload {
  const clean = (s: string) => (s.trim() ? s.trim() : undefined);
  const cover = { ...payload.cover };
  const p = clean(purpose);
  const i = clean(info);
  if (p) cover.purpose = p;
  else delete cover.purpose;
  if (i) cover.info = i;
  else delete cover.info;
  return { ...payload, cover };
}

type Phase = "compose" | "creating" | "ready";

export function ShareDialog({
  payload,
  trigger,
  allowEditCover = false,
  existingSlug,
}: {
  payload: SharePayload;
  trigger: ReactNode;
  allowEditCover?: boolean;
  /** Re-share of an already-stored session: reuse this slug instead of minting one. */
  existingSlug?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("compose");
  const [purpose, setPurpose] = useState(payload.cover.purpose ?? "");
  const [info, setInfo] = useState(payload.cover.info ?? "");
  const [origin, setOrigin] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  // origin is client-only; read it after mount so SSR renders a stable shell.
  useEffect(() => setOrigin(window.location.origin), []);

  const effective = useMemo(
    () => (allowEditCover ? withCover(payload, purpose, info) : payload),
    [payload, allowEditCover, purpose, info],
  );

  // A re-share already has a stored slug — jump straight to the ready link.
  useEffect(() => {
    if (!open) {
      setPhase("compose");
      setShareUrl("");
      setUsedFallback(false);
      return;
    }
    if (existingSlug && origin) {
      setShareUrl(`${origin}/follow/${existingSlug}`);
      setUsedFallback(false);
      setPhase("ready");
    }
  }, [open, existingSlug, origin]);

  // Editing the cover invalidates a link created for the old text.
  useEffect(() => {
    if (existingSlug) return;
    setPhase("compose");
    setShareUrl("");
    setUsedFallback(false);
  }, [purpose, info, existingSlug]);

  const create = async () => {
    if (!origin) return;
    setPhase("creating");
    try {
      const slug = await createShare(effective);
      setShareUrl(`${origin}/follow/${slug}`);
      setUsedFallback(false);
    } catch {
      // The self-contained fragment link still works with no backend.
      setShareUrl(`${origin}/follow#${encodeShare(effective)}`);
      setUsedFallback(true);
      toast.message("Sharing a full link", {
        description: "Couldn't create a short link right now — this one still works.",
      });
    }
    setPhase("ready");
  };

  // Short links always fit a QR; a fallback fragment only when it's short enough.
  const canQr = !!shareUrl && (!usedFallback || shareUrl.length <= QR_FRAGMENT_LIMIT);

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press the link to copy it");
    }
  };

  const nativeShare = async () => {
    if (!shareUrl) return;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (!nav.share) {
      void copy();
      return;
    }
    try {
      await nav.share({
        title: payload.cover.title,
        text: "Follow along with our prayer",
        url: shareUrl,
      });
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && !!(navigator as Navigator & { share?: unknown }).share;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share to follow along</DialogTitle>
          <DialogDescription>
            Anyone with this link can follow the prayers on their phone — no app needed. They can
            pass it on, too.
          </DialogDescription>
        </DialogHeader>

        {phase === "compose" ? (
          <div className="space-y-4">
            {allowEditCover ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="share-purpose">Intention (optional)</Label>
                  <Textarea
                    id="share-purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. For Grandma's health"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="share-info">Welcome note (optional)</Label>
                  <Textarea
                    id="share-info"
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                    placeholder="A short note shown at the top for your guests."
                    rows={3}
                  />
                </div>
              </>
            ) : null}
            <Button onClick={create} className="w-full" disabled={!origin}>
              Create share link
            </Button>
          </div>
        ) : null}

        {phase === "creating" ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Creating link…
          </div>
        ) : null}

        {phase === "ready" ? (
          <div className="space-y-4">
            {canQr ? (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl bg-white p-3">
                  <QRCodeSVG value={shareUrl} size={192} level="M" marginSize={0} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Point a phone camera here to open it
                </p>
              </div>
            ) : (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
                This link is a bit long for a scannable code — share the link instead.
              </p>
            )}

            {!usedFallback ? (
              <p className="truncate rounded-md border border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                {shareUrl.replace(/^https?:\/\//, "")}
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Using a full link — it still opens for anyone.
              </p>
            )}

            <div className="flex gap-2">
              <Button onClick={copy} variant="outline" className="flex-1">
                {copied ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
              {canNativeShare ? (
                <Button onClick={nativeShare} className="flex-1">
                  <Share2 className="mr-1.5 size-4" /> Share
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
