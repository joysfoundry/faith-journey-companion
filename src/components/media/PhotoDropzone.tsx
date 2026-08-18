import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface LocalPhoto {
  id: string;
  name: string;
  previewUrl: string;
}

interface PhotoDropzoneProps {
  label?: string;
  hint?: string;
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
}

/**
 * Add or drop photos (a printed page, a holy card, a moment during prayer).
 * Previews stay local until Cloud storage is on; reading text from a photo
 * needs the AI connector. Both are planned next.
 */
export function PhotoDropzone({ label = "Photos", hint, photos, onChange }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `photo_${Math.random().toString(36).slice(2, 10)}`,
        name: f.name,
        previewUrl: URL.createObjectURL(f),
      }));
    if (next.length) onChange([...photos, ...next]);
  };

  return (
    <div>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "mt-1 flex w-full flex-col items-center gap-1 rounded-md border border-dashed border-input bg-card/60 px-3 py-6 text-sm text-muted-foreground transition-colors",
          over && "border-primary bg-primary/5 text-primary",
        )}
      >
        <ImagePlus className="h-5 w-5" aria-hidden />
        <span>Add photos or drop them here</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {photos.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {photos.map((p) => (
            <li key={p.id} className="relative">
              <img
                src={p.previewUrl}
                alt={p.name}
                className="h-20 w-20 rounded-md border border-border object-cover"
              />
              <button
                type="button"
                aria-label={`Remove ${p.name}`}
                onClick={() => onChange(photos.filter((x) => x.id !== p.id))}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-background p-0.5 text-muted-foreground shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
