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
    const { action, userId, actorId, amount, reason } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    switch (action) {
      case "ban": {
        const { error } = await supabase
          .from("profiles")
          .update({ role: "banned" })
          .eq("id", userId);

        if (error) throw error;

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? authUser.data.user.id,
          action: "ban_user",
          entity: "user_profile",
          entity_id: userId,
          details: "User banned",
        });

        return new Response(
          JSON.stringify({ success: true, message: "User banned" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "unban": {
        const { error } = await supabase
          .from("profiles")
          .update({ role: "member" })
          .eq("id", userId);

        if (error) throw error;

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? authUser.data.user.id,
          action: "unban_user",
          entity: "user_profile",
          entity_id: userId,
          details: "User unbanned",
        });

        return new Response(
          JSON.stringify({ success: true, message: "User unbanned" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "delete": {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: "banned", display_name: "[Deleted User]" })
          .eq("id", userId);

        if (profileError) throw profileError;

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? authUser.data.user.id,
          action: "delete_user",
          entity: "user_profile",
          entity_id: userId,
          details: "User deleted (profile anonymized)",
        });

        return new Response(
          JSON.stringify({ success: true, message: "User deleted" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "adjust_vxp": {
        if (typeof amount !== "number" || amount === 0) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid amount" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("current_vxp, lifetime_vxp")
          .eq("id", userId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ success: false, error: "User not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const current = Number(profile.current_vxp ?? 0);
        const lifetime = Number(profile.lifetime_vxp ?? 0);
        const nextCurrent = current + amount;

        if (nextCurrent < 0) {
          return new Response(
            JSON.stringify({ success: false, error: "Insufficient VXP" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const nextLifetime = amount > 0 ? lifetime + amount : lifetime;

        await supabase.from("wallet_ledger").insert({
          user_id: userId,
          amount,
          transaction_type: "ADMIN_ADJUSTMENT",
          reference_type: "admin",
          reference_id: `admin_${Date.now()}`,
          description: reason ?? "Admin adjustment",
        });

        await supabase
          .from("profiles")
          .update({ current_vxp: nextCurrent, lifetime_vxp: nextLifetime })
          .eq("id", userId);

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? authUser.data.user.id,
          action: "adjust_vxp",
          entity: "user_profile",
          entity_id: userId,
          details: `VXP adjusted by ${amount}: ${reason ?? "Admin adjustment"}`,
        });

        return new Response(
          JSON.stringify({ success: true, current_vxp: nextCurrent, lifetime_vxp: nextLifetime }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
