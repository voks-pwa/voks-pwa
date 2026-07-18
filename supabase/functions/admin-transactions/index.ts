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

    /*
      ===========================
      Ambil semua transaksi
      ===========================
    */

    const {
      data: transactions,
      error: trxError,
    } = await supabase
      .from("vxp_transactions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (trxError) throw trxError;

    /*
      ===========================
      Ambil semua profile
      ===========================
    */

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

    /*
      ===========================
      Mapping profile
      ===========================
    */

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        profile,
      ])
    );

    /*
      ===========================
      Gabungkan transaksi + profile
      ===========================
    */

    const result = (transactions ?? []).map((trx) => ({
      ...trx,
      profile:
        profileMap.get(trx.user_id) ?? null,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        transactions: result,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);

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