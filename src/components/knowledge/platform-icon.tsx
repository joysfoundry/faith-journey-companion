import { Facebook, Globe, Instagram, Link, Music, Podcast, Store, Twitter, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { LinkPlatform } from "@/lib/prayer/types";

/**
 * Platform → recognizable icon for a channel/link chip, so a channel reads as the
 * channel (its platform) rather than a free-text name (ACTS-178). lucide ships no
 * TikTok mark, so it borrows `Music`; `x` uses the Twitter bird (closest lucide has).
 */
export const PLATFORM_ICON: Record<LinkPlatform, LucideIcon> = {
  instagram: Instagram,
  tiktok: Music,
  youtube: Youtube,
  x: Twitter,
  facebook: Facebook,
  podcast: Podcast,
  website: Globe,
  store: Store,
  other: Link,
};
