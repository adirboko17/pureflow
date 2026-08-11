import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { invalidateBlockedIpCache } from "@/lib/ip-block.server";

function isAdminEmail(email: unknown): boolean {
  if (typeof email !== "string" || !email.trim()) return false;
  const allow = (process.env["ADMIN_EMAIL"] ?? process.env["VITE_ADMIN_EMAIL"] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return false;
  return allow.includes(email.trim().toLowerCase());
}

async function requireAdmin(context: {
  claims: unknown;
  supabase: { auth: { getUser: () => Promise<{ data: { user: { email?: string | null } | null } }> } };
}) {
  const claimsEmail = (context.claims as { email?: string }).email;
  let email = claimsEmail;
  if (!email) {
    const { data: userData } = await context.supabase.auth.getUser();
    email = userData.user?.email ?? undefined;
  }
  if (!isAdminEmail(email)) {
    throw new Error("Forbidden: not an admin user.");
  }
  return email;
}

const ipSchema = z.object({
  ip: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[0-9a-fA-F:.]+$/, "Invalid IP address"),
  reason: z.string().trim().max(200).optional().nullable(),
});

export const blockIp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => ipSchema.parse(data))
  .handler(async ({ data, context }) => {
    const email = await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blocked_ips").upsert(
      {
        ip_address: data.ip,
        reason: data.reason ?? "Blocked from admin dashboard",
        created_by: email ?? null,
      },
      { onConflict: "ip_address" },
    );
    if (error) {
      console.error("[ip-block] block failed", error.message);
      throw new Error("Could not block IP.");
    }
    invalidateBlockedIpCache();
    return { ok: true as const };
  });

export const unblockIp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ ip: ipSchema.shape.ip }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blocked_ips").delete().eq("ip_address", data.ip);
    if (error) {
      console.error("[ip-block] unblock failed", error.message);
      throw new Error("Could not unblock IP.");
    }
    invalidateBlockedIpCache();
    return { ok: true as const };
  });
