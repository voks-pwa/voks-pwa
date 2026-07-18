import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

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

  try {

    const { data: redemptions, error } = await supabase
      .from("reward_redemptions")
      .select("*")
      .order("redeemed_at", {
        ascending: false,
      });

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
      profile:
        profileMap[item.user_id as string] ?? null,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        redemptions: result,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          err instanceof Error
            ? err.message
            : String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});