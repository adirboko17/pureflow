import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  zip: z.string().trim().regex(/^[0-9]{5}$/),
  service: z.string().trim().min(2).max(120),
  source: z.string().trim().max(60).optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("leads")
      .insert({
      name: data.name,
      phone: data.phone,
      zip: data.zip,
      service: data.service,
      source: data.source ?? null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[leads] insert failed", error.message);
      throw new Error("Could not save your request. Please try again.");
    }

    const { notifyNewLead } = await import("@/lib/lead-notify.server");
    await notifyNewLead({
      id: inserted?.id,
      name: data.name,
      phone: data.phone,
      zip: data.zip,
      service: data.service,
      source: data.source ?? null,
    });

    return { ok: true };
  });
