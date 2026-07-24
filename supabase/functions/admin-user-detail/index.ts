import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const inputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

Deno.serve(async (req) => {
  console.log("[admin-user-detail] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const adminCheck = await requireAdmin(authHeader);
    if ("error" in adminCheck) return adminCheck.error;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rawBody = await req.text().catch(() => null);
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[admin-user-detail] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-user-detail] validation passed");

    const { userId } = parsed.data;

    console.log("[admin-user-detail] fetching data for user:", userId);
    const [
      profileResult,
      missionCount,
      transactionCount,
      redemptionCount,
      recentTransactions,
      recentMissions,
      recentRedemptions,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("mission_completions").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("vxp_transactions").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("reward_redemptions").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("vxp_transactions").select("created_at, amount, transaction_type, reason").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("mission_completions").select("completed_at, mission_id, xp_earned").eq("user_id", userId).order("completed_at", { ascending: false }).limit(20),
      supabase.from("reward_redemptions").select("redeemed_at, reward_title, reward_cost, reward_status").eq("user_id", userId).order("redeemed_at", { ascending: false }).limit(20),
    ]);

    if (profileResult.error) throw profileResult.error;

    console.log("[admin-user-detail] ✔ response for user:", userId);
    return new Response(
      JSON.stringify({
        success: true,
        profile: profileResult.data,
        stats: {
          missionCount: missionCount.count ?? 0,
          transactionCount: transactionCount.count ?? 0,
          redemptionCount: redemptionCount.count ?? 0,
        },
        recentTransactions: recentTransactions.data ?? [],
        recentMissions: recentMissions.data ?? [],
        recentRedemptions: recentRedemptions.data ?? [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[admin-user-detail] ✖ EXCEPTION:", String(err));
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
