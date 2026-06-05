import { createServerFn } from "@tanstack/react-start";

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const { data: row, error } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();
  if (error) return { site_name: "AUTOLUXE" };
  return { site_name: String(row?.value?.site_name ?? "AUTOLUXE") };
});