import { useEffect, useRef, useState } from "react";
import { Link2, Mic, Square, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newId } from "@/lib/prayer/compiler";
import type { PrayerMedia, PrayerMediaKind } from "@/lib/prayer/types";

/** Small clips can be embedded in the local store; larger files need cloud storage. */
const MAX_LOCAL_BYTES = 1.5 * 1024 * 1024; // ~1.5 MB — a recited prayer, not a whole session

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function MediaPlayer({ item }: { item: PrayerMedia }) {
  if (item.kind === "video") {
    // External video links (YouTube etc.) open out; embedded data-URL video plays inline.
    if (item.source === "link") {
      return (
        <ExtLink href={item.url} className="text-sm text-primary underline">
          Open video
        </ExtLink>
      );
    }
    return <video controls src={item.url} className="mt-1 w-full rounded-md" />;
  }
  return <audio controls src={item.url} className="mt-1 w-full" />;
}

export function MediaEditor({
  media,
  onChange,
}: {
  media: PrayerMedia[];
  onChange: (next: PrayerMedia[]) => void;
}) {
  const [linkKind, setLinkKind] = useState<PrayerMediaKind>("audio");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => stopTimer(), []);
  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const add = (item: PrayerMedia) => onChange([...media, item]);
  const remove = (id: string) => onChange(media.filter((m) => m.id !== id));

  function addLink() {
    setError(null);
    const url = linkUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }
    add({
      id: newId("media"),
      kind: linkKind,
      source: "link",
      url,
      label: linkLabel.trim() || undefined,
      created_at: new Date().toISOString(),
    });
    setLinkUrl("");
    setLinkLabel("");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const kind: PrayerMediaKind = file.type.startsWith("video/") ? "video" : "audio";
      if (file.size > MAX_LOCAL_BYTES) {
        setError(
          `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Files over 1.5 MB need cloud storage — add it as a link for now.`,
        );
      } else {
        const url = await readAsDataUrl(file);
        add({
          id: newId("media"),
          kind,
          source: "file",
          url,
          label: file.name,
          created_at: new Date().toISOString(),
        });
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size > MAX_LOCAL_BYTES) {
          setError(
            "That recording is too long to keep locally (over 1.5 MB). Short prayer clips work; whole-session recording needs cloud storage.",
          );
        } else {
          const url = await readAsDataUrl(blob);
          add({
            id: newId("media"),
            kind: "audio",
            source: "recording",
            url,
            label: `Recording · ${new Date().toLocaleDateString()}`,
            duration_sec: seconds,
            created_at: new Date().toISOString(),
          });
        }
        setRecording(false);
        setSeconds(0);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone permission is needed to record. You can add a link or file instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  return (
    <div className="soft-card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Audio &amp; video</p>
        {media.length > 0 ? (
          <span className="text-xs text-muted-foreground">{media.length} attached</span>
        ) : null}
      </div>

      {media.length > 0 ? (
        <ul className="space-y-2">
          {media.map((m) => (
            <li key={m.id} className="rounded-lg border border-border/70 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium">
                  {m.label ?? (m.kind === "video" ? "Video" : "Audio")}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {m.kind} · {m.source}
                    {m.duration_sec ? ` · ${m.duration_sec}s` : ""}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove media"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <MediaPlayer item={m} />
            </li>
          ))}
        </ul>
      ) : null}

      {/* Add a link */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Add a link (audio or video)</Label>
        <div className="flex gap-2">
          <select
            value={linkKind}
            onChange={(e) => setLinkKind(e.target.value as PrayerMediaKind)}
            className="h-10 rounded-md border border-input bg-card px-2 text-sm"
            aria-label="Media kind"
          >
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="h-10 flex-1"
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Label (optional)"
            className="h-10 flex-1"
          />
          <Button type="button" variant="secondary" className="h-10" onClick={addLink} disabled={!linkUrl.trim()}>
            <Link2 className="size-4" /> Add link
          </Button>
        </div>
      </div>

      {/* Record / upload short clip */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {recording ? (
          <Button type="button" variant="destructive" className="h-10" onClick={stopRecording}>
            <Square className="size-4" /> Stop · {seconds}s
          </Button>
        ) : (
          <Button type="button" variant="secondary" className="h-10" onClick={startRecording}>
            <Mic className="size-4" /> Record a clip
          </Button>
        )}
        <Button type="button" variant="secondary" className="h-10" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" /> Upload file
        </Button>
        <input ref={fileRef} type="file" accept="audio/*,video/*" className="hidden" onChange={onFile} />
        <span className="text-xs text-muted-foreground">Short clips only (≤1.5 MB); longer recordings need cloud storage.</span>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
