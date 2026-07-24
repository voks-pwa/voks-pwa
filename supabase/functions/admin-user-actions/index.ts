import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const inputSchema = z.object({
  action: z.enum(["ban", "unban", "delete", "update_role", "adjust_vxp"]),
  userId: z.string().min(1, "userId is required"),
  actorId: z.string().optional(),
  amount: z.number().optional(),
  reason: z.string().optional(),
  role: z.string().optional(),
});

Deno.serve(async (req) => {
  console.log("[admin-user-actions] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  const adminCheck = await requireAdmin(authHeader);
  if ("error" in adminCheck) return adminCheck.error;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const rawBody = await req.text().catch(() => null);
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[admin-user-actions] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-user-actions] validation passed, action:", parsed.data.action);

    const { action, userId, actorId, amount, reason, role } = parsed.data;

    switch (action) {
      case "ban": {
        console.log("[admin-user-actions] banning user:", userId);
        const { error } = await supabase
          .from("profiles")
          .update({ role: "banned" })
          .eq("id", userId);

        if (error) throw error;

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? adminCheck.caller.id,
          action: "ban_user",
          entity: "user_profile",
          entity_id: userId,
          details: "User banned",
        });

        console.log("[admin-user-actions] ✔ ban success:", userId);
        return new Response(
          JSON.stringify({ success: true, message: "User banned" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "unban": {
        console.log("[admin-user-actions] unbanning user:", userId);
        const { error } = await supabase
          .from("profiles")
          .update({ role: "member" })
          .eq("id", userId);

        if (error) throw error;

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? adminCheck.caller.id,
          action: "unban_user",
          entity: "user_profile",
          entity_id: userId,
          details: "User unbanned",
        });

        console.log("[admin-user-actions] ✔ unban success:", userId);
        return new Response(
          JSON.stringify({ success: true, message: "User unbanned" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "delete": {
        console.log("[admin-user-actions] deleting user:", userId);
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: "banned", display_name: "[Deleted User]" })
          .eq("id", userId);

        if (profileError) throw profileError;

        await supabase.from("admin_audit_log").insert({
          actor_id: actorId ?? adminCheck.caller.id,
          action: "delete_user",
          entity: "user_profile",
          entity_id: userId,
          details: "User deleted (profile anonymized)",
        });

        console.log("[admin-user-actions] ✔ delete success:", userId);
        return new Response(
          JSON.stringify({ success: true, message: "User deleted" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "update_role": {
        if (!role || !["member", "admin", "superadmin", "banned"].includes(role)) {
          console.warn("[admin-user-actions] invalid role:", role);
          return new Response(
            JSON.stringify({ success: false, error: "Invalid role" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        console.log("[admin-user-actions] updating role for", userId, "to", role);
        const { error } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", userId);

        if (error) throw error;

        await supabase.from("admin_audit_log").insert({
          actor_id: adminCheck.caller.id,
          action: "role_update",
          entity: "user_profile",
          entity_id: userId,
          details: `User role updated to ${role}`,
        });

        console.log("[admin-user-actions] ✔ role update success:", userId, "→", role);
        return new Response(
          JSON.stringify({ success: true, message: `Role updated to ${role}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "adjust_vxp": {
        if (typeof amount !== "number" || amount === 0) {
          console.warn("[admin-user-actions] invalid VXP amount:", amount);
          return new Response(
            JSON.stringify({ success: false, error: "Invalid amount" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        console.log("[admin-user-actions] adjusting VXP for", userId, "by", amount);
        const { data: profile } = await supabase
          .from("profiles")
          .select("current_vxp, lifetime_vxp")
          .eq("id", userId)
          .single();

        if (!profile) {
          console.warn("[admin-user-actions] user not found:", userId);
          return new Response(
            JSON.stringify({ success: false, error: "User not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const current = Number(profile.current_vxp ?? 0);
        const lifetime = Number(profile.lifetime_vxp ?? 0);
        const nextCurrent = current + amount;

        if (nextCurrent < 0) {
          console.warn("[admin-user-actions] insufficient VXP for", userId);
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
          actor_id: actorId ?? adminCheck.caller.id,
          action: "adjust_vxp",
          entity: "user_profile",
          entity_id: userId,
          details: `VXP adjusted by ${amount}: ${reason ?? "Admin adjustment"}`,
        });

        console.log("[admin-user-actions] ✔ VXP adjustment success:", userId, amount);
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
    console.error("[admin-user-actions] ✖ EXCEPTION:", String(err));
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
