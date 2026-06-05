import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(4).max(30),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(500),
  notes: z.string().max(1000).nullable().optional(),
  car_id: z.string().trim().min(1).max(100),
  car_name: z.string().trim().min(1).max(200),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      city: data.city,
      address: data.address,
      notes: data.notes || null,
      car_id: data.car_id,
      car_name: data.car_name,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
