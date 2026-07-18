import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authUser = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authUser.error || !authUser.data.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
