import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const inputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  amount: z.number().min(0.01, "amount must be a positive number"),
  transaction_type: z.enum(["mission", "reward", "bonus", "admin", "referral", "manual"]),
  reason: z.string().optional(),
  reference_id: z.string().optional(),
});

Deno.serve(async (req) => {
  console.log("[xp-transaction] ▶ request", req.method, req.url);

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
      console.warn("[xp-transaction] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[xp-transaction] validation passed");

    const { userId, amount, transaction_type, reason, reference_id } = parsed.data;

    if (adminCheck.caller.id !== userId) {
      console.warn("[xp-transaction] forbidden: caller mismatch");
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: can only transact on own behalf" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const walletType = mapTransactionType(transaction_type);
    const transactionKey = `${walletType}_${userId}_${reference_id ?? "manual"}_${Date.now()}`;

    console.log("[xp-transaction] creating transaction, type:", transaction_type, "amount:", amount);
    const { data: createResult, error: createError } = await supabase
      .rpc("create_transaction", {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: walletType,
        p_transaction_key: transactionKey,
        p_source: transaction_type,
        p_reference_id: reference_id ?? "",
        p_description: reason ?? "",
      });

    if (createError) throw createError;

    if (!createResult?.success) {
      if (createResult?.duplicate) {
        console.log("[xp-transaction] duplicate transaction, skipped");
        return new Response(
          JSON.stringify({ success: true, message: "Duplicate transaction, skipped" }),
          { status: 200, headers: corsHeaders },
        );
      }
      console.warn("[xp-transaction] transaction creation failed:", createResult?.error);
      return new Response(
        JSON.stringify({ success: false, message: createResult?.error ?? "Transaction creation failed" }),
        { status: 400, headers: corsHeaders },
      );
    }

    console.log("[xp-transaction] committing transaction");
    const { data: commitResult, error: commitError } = await supabase
      .rpc("commit_transaction", {
        p_transaction_key: transactionKey,
      });

    if (commitError) throw commitError;

    if (!commitResult?.success) {
      await supabase.rpc("fail_transaction", {
        p_transaction_key: transactionKey,
        p_reason: "commit failed",
      }).catch(() => {});

      console.error("[xp-transaction] commit failed");
      return new Response(
        JSON.stringify({ success: false, message: commitResult?.error ?? "Transaction commit failed" }),
        { status: 500, headers: corsHeaders },
      );
    }

    await supabase
      .from("vxp_transactions")
      .insert({
        user_id: userId,
        amount,
        transaction_type,
        reason,
        reference_id,
        transaction_key: transactionKey,
      })
      .catch(() => {});

    console.log("[xp-transaction] ✔ success, key:", transactionKey);
    return new Response(
      JSON.stringify({
        success: true,
        transaction_key: transactionKey,
        current_vxp: createResult.after_balance,
        lifetime_vxp: commitResult.lifetime_vxp,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("[xp-transaction] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
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
