/**
 * Server-side access to follow-along shares (ACTS-94, hardened).
 *
 * `public.shared_sessions` is no longer reachable from the browser: the table has
 * no client grants/policies. Reads and writes go through these server functions,
 * which use the privileged client after validating input. Reads are exact-slug
 * only (no listing/enumeration of rows), and writes are size-capped.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_PAYLOAD_CHARS = 100_000;

const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "invalid slug");

export const saveShare = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string; payload: string }) =>
    z
      .object({
        slug: slugSchema,
        payload: z.string().min(1).max(MAX_PAYLOAD_CHARS),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("shared_sessions")
      .insert({ slug: data.slug, payload: data.payload });
    if (error) {
      if (error.code === "23505") return { ok: false as const, reason: "collision" as const };
      console.error("saveShare failed", error.message);
      return { ok: false as const, reason: "error" as const };
    }
    return { ok: true as const, slug: data.slug };
  });

export const loadShare = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => z.object({ slug: slugSchema }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("shared_sessions")
      .select("payload")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error || !row) return { payload: null as string | null };
    return { payload: row.payload as string };
  });
