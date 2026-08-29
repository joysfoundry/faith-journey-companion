import { X } from "lucide-react";
import { useEffect } from "react";

import { Brand } from "./Brand";
import { NavSections } from "./NavSections";

/**
 * Mobile menu — the full nav (primary + secondary) as a left slide-in drawer,
 * opened from the bottom bar's Menu button. Hidden at md+ (the rail is shown).
 */
export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-parchment shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Brand onClick={onClose} tagline />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-foreground/5"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6">
          <NavSections onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
