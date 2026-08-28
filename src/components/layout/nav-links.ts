import {
  CalendarDays,
  Download,
  Heart,
  Home,
  Lightbulb,
  NotebookPen,
  Settings,
  Sun,
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
  { to: "/word", label: "Word", icon: Sun },
  { to: "/reflections", label: "Reflect", icon: NotebookPen },
] as const;

/**
 * Secondary navigation — a lower section of the menu. On mobile the whole menu
 * (primary + secondary) opens as a drawer from the bottom-bar Menu button.
 */
export const secondaryNavLinks = [
  { to: "/formation", label: SECTION_LABEL, icon: Lightbulb },
  { to: "/import", label: "Add prayers", icon: Download },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
