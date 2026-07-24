import { createClient } from "npm:@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  console.log("[admin-rewards] ▶ request", req.method, req.url);

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
    console.log("[admin-rewards] fetching all redemptions");
    const { data: redemptions, error } = await supabase
      .from("reward_redemptions")
      .select("*")
      .order("redeemed_at", { ascending: false });

    if (error) throw error;

    const userIds = [
      ...new Set(
        (redemptions ?? [])
          .map((r) => r.user_id)
          .filter(Boolean)
      ),
    ];

    let profileMap: Record<string, unknown> = {};

    if (userIds.length > 0) {
      console.log("[admin-rewards] fetching", userIds.length, "profiles");
      const { data: profiles } = await supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          email,
          avatar_url,
          role,
          level,
          badge_name
        `)
        .in("id", userIds);

      profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.id, p])
      );
    }

    const result = (redemptions ?? []).map((item) => ({
      ...item,
      profile: profileMap[item.user_id as string] ?? null,
    }));

    console.log("[admin-rewards] ✔ response, redemptions:", result.length);
    return new Response(
      JSON.stringify({ success: true, redemptions: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-rewards] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
