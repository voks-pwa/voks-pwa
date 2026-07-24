import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const inputSchema = z.object({
  redemptionId: z.number().int().positive("redemptionId must be a positive integer"),
  status: z.enum(["approved", "completed", "cancelled", "rejected"]),
  notes: z.string().optional(),
});

Deno.serve(async (req) => {
  console.log("[admin-update-redemption] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  const adminCheck = await requireAdmin(authHeader);
  if ("error" in adminCheck) return adminCheck.error;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const rawBody = await req.text().catch(() => null);
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[admin-update-redemption] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-update-redemption] validation passed");

    const { redemptionId, status, notes } = parsed.data;

    const updateData: Record<string, unknown> = {
      reward_status: status,
      notes: notes ?? null,
    };

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    console.log("[admin-update-redemption] updating redemption ID:", redemptionId, "status:", status);
    const { data, error } = await supabase
      .from("reward_redemptions")
      .update(updateData)
      .eq("id", redemptionId)
      .select()
      .single();

    if (error) throw error;

    console.log("[admin-update-redemption] ✔ update success");
    return new Response(
      JSON.stringify({ success: true, redemption: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-update-redemption] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
