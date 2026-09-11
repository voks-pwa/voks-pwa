import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const WP_WEBHOOK_SECRET = Deno.env.get("WP_WEBHOOK_SECRET"); // set via supabase secrets set WP_WEBHOOK_SECRET=xxx

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Verify webhook secret if configured
  if (WP_WEBHOOK_SECRET) {
    const sig = req.headers.get("x-webhook-signature") ?? req.headers.get("x-wp-webhook-secret");
    if (sig !== WP_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ success: false, error: "Invalid webhook signature" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // WP payload: supports both {id, acf:{...}, title:{rendered}, date} and {title,message,...}
    const wpId = body.id ?? body.wp_id ?? body.notification_id;
    const acf = body.acf ?? {};
    const title =
      acf.notification_title ?? body.title ?? body.notification_title ?? body.title?.rendered ?? "Notification";
    const message =
      acf.notification_message ?? body.message ?? body.notification_message ?? "";
    const imageUrl = acf.notification_image_url ?? body.image_url ?? null;
    const deepLink = acf.deep_link ?? body.deep_link ?? null;
    const notifType = acf.notification_type ?? body.notification_type ?? "Update";
    const priority = acf.notification_priority ?? "Normal";
    const audience = acf.audience ?? body.audience ?? "all";

    if (!title || !message) {
      return new Response(JSON.stringify({ success: false, error: "title and message required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 1. Insert broadcast record (for admin history)
    const { data: broadcast, error: bcError } = await supabase
      .from("broadcasts")
      .insert({
        title,
        message,
        type: notifType,
        priority,
        audience,
        deep_link: deepLink,
        image_url: imageUrl,
        // Use a system UUID for WP-originated broadcasts (fetch first admin or use service)
        // We need created_by — use first admin profile as placeholder
        created_by: (
          await supabase.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle()
        ).data?.id,
      })
      .select()
      .single();

    if (bcError) {
      console.error("[wp-notification-bridge] broadcast insert failed", bcError);
      // Continue to notifications even if broadcast fails
    }

    // 2. Resolve target user_ids (broadcast to all = all profiles)
    let targetIds: { id: string }[] = [];
    if (audience === "all") {
      const { data, error } = await supabase.from("profiles").select("id");
      if (error) throw error;
      targetIds = data ?? [];
    } else {
      const { data, error } = await supabase.from("profiles").select("id").eq("role", audience);
      if (error) throw error;
      targetIds = data ?? [];
    }

    if (targetIds.length === 0) {
      return new Response(JSON.stringify({ success: true, sent_count: 0, broadcast_id: broadcast?.id ?? null, wp_id: wpId ?? null }), {
        headers: corsHeaders,
      });
    }

    const notifications = targetIds.map((p) => ({
      user_id: p.id,
      type: notifType,
      title,
      message,
      priority,
      deep_link: deepLink,
      image_url: imageUrl,
      broadcast_id: broadcast?.id ?? null,
    }));

    // Batch insert (chunk 500 to avoid payload limit)
    let sent = 0;
    for (let i = 0; i < notifications.length; i += 500) {
      const chunk = notifications.slice(i, i + 500);
      const { error } = await supabase.from("notifications").insert(chunk);
      if (error) throw error;
      sent += chunk.length;
    }

    // Mark broadcast as sent
    if (broadcast?.id) {
      await supabase.from("broadcasts").update({ sent_at: new Date().toISOString() }).eq("id", broadcast.id);
    }

    return new Response(JSON.stringify({ success: true, sent_count: sent, broadcast_id: broadcast?.id ?? null, wp_id: wpId ?? null }), {
      headers: corsHeaders,
    });
  } catch (err) {
    const e = err as { message?: string };
    console.error("[wp-notification-bridge] exception", e?.message ?? err);
    return new Response(JSON.stringify({ success: false, error: e?.message ?? String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
