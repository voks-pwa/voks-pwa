import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
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
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authUser = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );

  if (authUser.error || !authUser.data.user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const { userId, amount, transaction_type, reason, reference_id } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "userId required" }),
        { status: 400, headers: corsHeaders },
      );
    }

    if (typeof amount !== "number" || amount === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid amount" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_vxp,lifetime_vxp")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    const current = Number(profile.current_vxp ?? 0);
    const lifetime = Number(profile.lifetime_vxp ?? 0);
    const nextCurrent = current + amount;

    if (nextCurrent < 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Insufficient VXP" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const nextLifetime = amount > 0 ? lifetime + amount : lifetime;

    // Write to vxp_transactions (legacy)
    const { data: trx, error: trxError } = await supabase
      .from("vxp_transactions")
      .insert({ user_id: userId, amount, transaction_type, reason, reference_id })
      .select()
      .single();

    if (trxError) throw trxError;

    // Write to wallet_ledger (new canonical ledger)
    const walletType = mapTransactionType(transaction_type);
    await supabase
      .from("wallet_ledger")
      .insert({
        user_id: userId,
        amount,
        transaction_type: walletType,
        reference_type: transaction_type,
        reference_id: reference_id ?? "",
        description: reason ?? "",
      });

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ current_vxp: nextCurrent, lifetime_vxp: nextLifetime })
      .eq("id", userId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        transaction: trx,
        current_vxp: nextCurrent,
        lifetime_vxp: nextLifetime,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: corsHeaders },
    );
  }
});

function mapTransactionType(t: string): string {
  switch (t) {
    case "mission": return "MISSION_REWARD";
    case "reward": return "REDEEM";
    case "bonus": return "BONUS";
    case "admin": return "ADMIN_ADJUSTMENT";
    case "referral": return "REFERRAL";
    case "manual": return "SYSTEM";
    default: return "SYSTEM";
  }
}
