/**
 * Share a compiled session as a guest "follow-along" link (ACTS-94).
 *
 * Works purely from a `SharePayload`, so the same dialog serves two callers:
 *  - the **leader** in a running session (`allowEditCover` → type a purpose/info
 *    blurb, which is folded into the cover before encoding), and
 *  - a **guest** on `/follow` re-sharing the link they received (no editing —
 *    handoff passes the identical, sender-agnostic link onward).
 *
 * The link is `<origin>/follow#<compressed payload>` — everything rides in the
 * fragment, so no backend is involved. A QR code is offered **best-effort**: only
 * when the link is short enough to scan reliably off a phone (short sessions);
 * longer ones (a full rosary) fall back to link-only. See ACTS-93 for the sizing.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Share2 } from "lucide-react";
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

export function ShareDialog({
  payload,
  trigger,
  allowEditCover = false,
}: {
  payload: SharePayload;
  trigger: ReactNode;
  allowEditCover?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState(payload.cover.purpose ?? "");
  const [info, setInfo] = useState(payload.cover.info ?? "");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  // origin is client-only; read it after mount so SSR renders a stable shell.
  useEffect(() => setOrigin(window.location.origin), []);

  const effective = useMemo(
    () => (allowEditCover ? withCover(payload, purpose, info) : payload),
    [payload, allowEditCover, purpose, info],
  );
  // Encoding can be non-trivial (a rosary is ~10 KB), so only do it while the
  // dialog is open — a list of rows each holding a closed ShareDialog stays cheap.
  const fragment = useMemo(() => (open ? encodeShare(effective) : ""), [open, effective]);
  const url = origin && fragment ? `${origin}/follow#${fragment}` : "";

  // The QR encodes the whole URL, so gate on the full length (a hair stricter than
  // the fragment budget — the origin eats a few chars). Long sessions → link only.
  const canQr = url.length > 0 && url.length <= QR_FRAGMENT_LIMIT;

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press the link to copy it");
    }
  };

  const nativeShare = async () => {
    if (!url) return;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (!nav.share) {
      void copy();
      return;
    }
    try {
      await nav.share({ title: payload.cover.title, text: "Follow along with our prayer", url });
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

        {allowEditCover ? (
          <div className="space-y-4">
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
          </div>
        ) : null}

        {/* QR — best-effort for short sessions. Fixed light background so it scans in any theme. */}
        {canQr ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={url} size={192} level="M" marginSize={0} />
            </div>
            <p className="text-xs text-muted-foreground">Point a phone camera here to open it</p>
          </div>
        ) : (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
            This session is a bit long for a scannable code — share the link instead.
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={copy} variant="outline" className="flex-1" disabled={!url}>
            {copied ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          {canNativeShare ? (
            <Button onClick={nativeShare} className="flex-1" disabled={!url}>
              <Share2 className="mr-1.5 size-4" /> Share
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
