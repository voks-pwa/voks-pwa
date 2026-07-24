import { serve } from "@std/http/server";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("PAYMENT_WEBHOOK_SECRET") ?? "";

const webhookSchema = z.object({
  gateway: z.string().min(1),
  event_type: z.string().min(1),
  payment_id: z.string().optional(),
  order_id: z.string().optional(),
  gateway_txn_id: z.string().optional(),
  status: z.string().optional(),
  signature: z.string().optional(),
});

serve(async (req: Request) => {
  console.log("[payment-webhook] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.warn("[payment-webhook] method not allowed:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const gatewaySignature = req.headers.get("x-webhook-signature") ?? "";
    const rawBody = await req.text();

    console.log("[payment-webhook] verifying signature");
    if (WEBHOOK_SECRET) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );
      const signatureBytes = hexToBytes(gatewaySignature);
      const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        encoder.encode(rawBody),
      );

      if (!valid) {
        console.warn("[payment-webhook] invalid signature");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 401, headers: corsHeaders },
        );
      }
    }

    let bodyJson: unknown;
    try {
      bodyJson = JSON.parse(rawBody);
    } catch {
      console.warn("[payment-webhook] invalid JSON body");
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const parsed = webhookSchema.safeParse(bodyJson);
    if (!parsed.success) {
      console.warn("[payment-webhook] validation failed:", parsed.error.issues.map(i => i.message).join("; "));
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const body = parsed.data;
    console.log("[payment-webhook] event:", body.event_type, "gateway:", body.gateway, "payment:", body.payment_id);

    const eventKey = `${body.payment_id}_${body.event_type}`;

    const { data: existing } = await supabase
      .from("payment_webhook_log")
      .select("id, processed")
      .eq("raw_payload->>payment_id", body.payment_id)
      .eq("event_type", body.event_type ?? "unknown")
      .eq("processed", true)
      .maybeSingle();

    if (existing) {
      console.log("[payment-webhook] duplicate webhook, skipped");
      return new Response(
        JSON.stringify({ success: true, message: "Duplicate webhook, skipped" }),
        { headers: corsHeaders },
      );
    }

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
      console.error("[payment-webhook] failed to log webhook:", logError);
    }

    const logId = logEntry?.id;

    if (!body.payment_id) {
      console.warn("[payment-webhook] missing payment_id");
      await supabase
        .from("payment_webhook_log")
        .update({ processed: true, error: "Missing payment_id" })
        .eq("id", logId);

      return new Response(JSON.stringify({ error: "Missing payment_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

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

    console.log("[payment-webhook] updating payment status to:", internalStatus);
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
      console.error("[payment-webhook] payment update failed:", updateError.message);
      await supabase
        .from("payment_webhook_log")
        .update({ processed: true, error: updateError.message })
        .eq("id", logId);

      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    await supabase
      .from("payment_webhook_log")
      .update({
        processed: true,
        signature_valid: gatewaySignature !== "",
      })
      .eq("id", logId);

    console.log("[payment-webhook] ✔ processed:", body.payment_id, "→", internalStatus);
    return new Response(
      JSON.stringify({ success: true, payment_id: body.payment_id, status: internalStatus }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("[payment-webhook] ✖ EXCEPTION:", err instanceof Error ? err.message : "Internal server error");
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: corsHeaders },
    );
  }
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
