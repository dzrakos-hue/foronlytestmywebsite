import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});
const authSchema = z.object({ password: z.string().min(1).max(200) });
const specSchema = z.object({
  engine: z.string().max(200).optional(),
  power: z.string().max(200).optional(),
  transmission: z.string().max(200).optional(),
  drive: z.string().max(200).optional(),
  acceleration: z.string().max(200).optional(),
  topSpeed: z.string().max(200).optional(),
  fuel: z.string().max(200).optional(),
  seats: z.string().max(200).optional(),
});

const carPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().min(1).max(100).optional(),
  price: z.number().int().min(0).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  category: z.string().min(1).max(100).optional(),
  short_desc: z.string().min(1).max(1000).optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  images: z.array(z.string().min(1).max(500)).min(1).max(6).optional(),
  specs: specSchema.optional(),
});

async function check(password: string) {
  const { verifyAdminPassword, ADMIN_USERNAME } = await import("./admin-auth.server");
  verifyAdminPassword(password);
  return { ADMIN_USERNAME };
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => credSchema.parse(d))
  .handler(async ({ data }) => {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = await import("./admin-auth.server");
    if (data.username !== ADMIN_USERNAME || data.password !== ADMIN_PASSWORD) {
      throw new Error("بيانات الدخول غير صحيحة");
    }
    return { ok: true };
  });

export const adminVerifySession = createServerFn({ method: "POST" })
  .inputValidator((d) => authSchema.parse(d))
  .handler(async ({ data }) => {
    await check(data.password);
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "POST" })
  .inputValidator((d) => authSchema.parse(d))
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminListCars = createServerFn({ method: "POST" })
  .inputValidator((d) => authSchema.parse(d))
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("cars")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateCar = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    authSchema
      .extend({
        id: z.string().min(1).max(100),
        patch: carPatchSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cars").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUploadCarImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    authSchema
      .extend({
        fileName: z.string().min(1).max(200),
        contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/),
        data: z.string().min(1).max(8_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = data.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
    const buffer = Buffer.from(data.data, "base64");
    const { error } = await supabaseAdmin.storage.from("car-images").upload(path, buffer, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabaseAdmin.storage.from("car-images").getPublicUrl(path);
    return { url: urlData.publicUrl };
  });

export const adminCreateCar = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    authSchema
      .extend({
        car: z.object({
          name: z.string().min(1).max(200),
          brand: z.string().min(1).max(100),
          price: z.number().int().min(0),
          year: z.number().int().min(1900).max(2100),
          category: z.string().min(1).max(100),
          short_desc: z.string().min(1).max(1000),
          images: z.array(z.string().min(1).max(500)).min(1).max(6),
          specs: specSchema,
          active: z.boolean(),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = data.car.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `car-${Date.now()}`;
    let id = base;
    for (let i = 2; i < 100; i += 1) {
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from("cars")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (!existing) break;
      id = `${base}-${i}`;
    }
    const { count } = await supabaseAdmin.from("cars").select("id", { count: "exact", head: true });
    const { error } = await supabaseAdmin.from("cars").insert({
      id,
      ...data.car,
      sort_order: (count ?? 0) + 1,
    });
    if (error) throw new Error(error.message);
    return { ok: true, id };
  });

export const adminListFormFields = createServerFn({ method: "POST" })
  .inputValidator((d) => authSchema.parse(d))
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("form_fields")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpsertFormField = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    authSchema
      .extend({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(100).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "اسم تقني غير صالح"),
        label: z.string().min(1).max(200),
        type: z.enum(["text", "tel", "email", "textarea", "number"]),
        required: z.boolean(),
        placeholder: z.string().max(200).nullable().optional(),
        sort_order: z.number().int(),
        active: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { password, id, ...payload } = data;
    if (id) {
      const { error } = await supabaseAdmin.from("form_fields").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("form_fields").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteFormField = createServerFn({ method: "POST" })
  .inputValidator((d) => authSchema.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("form_fields").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetSiteSettings = createServerFn({ method: "POST" })
  .inputValidator((d) => authSchema.parse(d))
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { data: row, error } = await db
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { site_name: String((row?.value as any)?.site_name ?? "AUTOLUXE") };
  });

export const adminUpdateSiteSettings = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    authSchema.extend({ site_name: z.string().trim().min(1).max(80) }).parse(d),
  )
  .handler(async ({ data }) => {
    await check(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { error } = await db.from("site_settings").upsert({
      key: "general",
      value: { site_name: data.site_name },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
