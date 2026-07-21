import { serve } from "@std/http/server";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

interface WebhookEvent {
  gateway: string;
  event_type: string;
  payment_id?: string;
  order_id?: string;
  gateway_txn_id?: string;
  status?: string;
  signature?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body: WebhookEvent = await req.json();
    const gatewaySignature = req.headers.get("x-webhook-signature") ?? "";

    // Log raw webhook
    const { data: logEntry, error: logError } = await supabase
      .from("payment_webhook_log")
      .insert({
        gateway: body.gateway,
        event_type: body.event_type ?? "unknown",
        raw_payload: body,
        processed: false,
        signature_valid: false,
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to log webhook:", logError);
    }

    const logId = logEntry?.id;

    if (!body.payment_id) {
      await supabase
        .from("payment_webhook_log")
        .update({ processed: true, error: "Missing payment_id" })
        .eq("id", logId);

      return new Response(JSON.stringify({ error: "Missing payment_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Map gateway status to internal status
    const statusMap: Record<string, string> = {
      "success": "SUCCESS",
      "capture": "SUCCESS",
      "settlement": "SUCCESS",
      "deny": "FAILED",
      "cancel": "FAILED",
      "expire": "FAILED",
      "failure": "FAILED",
      "pending": "PENDING",
      "challenge": "PENDING",
    };

    const internalStatus = statusMap[body.status ?? ""] ?? "PENDING";

    // Update payment status (atomic with order status via RPC)
    const { error: updateError } = await supabase.rpc(
      "update_payment_status",
      {
        p_payment_id: body.payment_id,
        p_status: internalStatus,
        p_gateway_txn_id: body.gateway_txn_id ?? "",
        p_metadata: { ...body, signature: gatewaySignature },
      },
    );

    if (updateError) {
      await supabase
        .from("payment_webhook_log")
        .update({ processed: true, error: updateError.message })
        .eq("id", logId);

      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Mark webhook as processed
    await supabase
      .from("payment_webhook_log")
      .update({
        processed: true,
        signature_valid: gatewaySignature !== "",
      })
      .eq("id", logId);

    return new Response(
      JSON.stringify({ success: true, payment_id: body.payment_id, status: internalStatus }),
      { headers: corsHeaders },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: corsHeaders },
    );
  }
});
