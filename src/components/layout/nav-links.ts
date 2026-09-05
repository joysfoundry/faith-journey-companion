import {
  Amphora,
  BookOpen,
  CalendarDays,
  Download,
  FileDown,
  Heart,
  Home,
  Info,
  NotebookPen,
  Settings,
} from "lucide-react";

import { SECTION_LABEL } from "@/lib/prayer/knowledge";

/**
 * Primary navigation — shown on the mobile bottom bar and at the top of the
 * menu (desktop side rail + mobile drawer).
 */
export const primaryNavLinks = [
  { to: "/", label: "Today", icon: Home },
  { to: "/pray", label: "Plan", icon: CalendarDays },
  { to: "/prayers", label: "Prayers", icon: Heart },
  { to: "/word", label: "Word", icon: BookOpen },
  { to: "/reflections", label: "Reflect", icon: NotebookPen },
] as const;

/**
 * Secondary navigation — a lower section of the menu. On mobile the whole menu
 * (primary + secondary) opens as a drawer from the bottom-bar Menu button.
 */
export const secondaryNavLinks = [
  { to: "/formation", label: SECTION_LABEL, icon: Amphora },
  { to: "/import", label: "Add prayers", icon: Download },
  { to: "/export", label: "Export journey", icon: FileDown },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
] as const;
