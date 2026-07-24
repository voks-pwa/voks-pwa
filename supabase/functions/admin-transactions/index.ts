import { createClient } from "npm:@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  console.log("[admin-transactions] ▶ request", req.method, req.url);

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
    console.log("[admin-transactions] fetching all transactions");
    const {
      data: transactions,
      error: trxError,
    } = await supabase
      .from("vxp_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (trxError) throw trxError;

    console.log("[admin-transactions] fetching profiles");
    const {
      data: profiles,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        email,
        avatar_url,
        role,
        level,
        badge_name
      `);

    if (profileError) throw profileError;

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile])
    );

    const result = (transactions ?? []).map((trx) => ({
      ...trx,
      profile: profileMap.get(trx.user_id) ?? null,
    }));

    console.log("[admin-transactions] ✔ response, transactions:", result.length);
    return new Response(
      JSON.stringify({ success: true, transactions: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-transactions] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
