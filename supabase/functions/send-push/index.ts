import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
  const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@voksradio.com";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), { status: 500, headers: corsHeaders });
  }
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ success: false, error: "VAPID keys not configured" }), { status: 500, headers: corsHeaders });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, user_id, title, body: msgBody, message, url, tag } = body as Record<string, string>;

    const targetUserId = userId ?? user_id;
    if (!targetUserId) {
      return new Response(JSON.stringify({ success: false, error: "userId required" }), { status: 400, headers: corsHeaders });
    }

    const payload = JSON.stringify({
      title: title ?? "Voks Radio",
      body: msgBody ?? message ?? "Update baru dari Voks",
      url: url ?? "/",
      tag: tag ?? "voks-push",
    });

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth,is_active")
      .eq("user_id", targetUserId)
      .eq("is_active", true);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No active subscriptions" }), { headers: corsHeaders });
    }

    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as never,
            payload,
          );
          sent++;
        } catch (e) {
          failed++;
          // 410 Gone = subscription expired — deactivate
          const code = (e as { statusCode?: number })?.statusCode;
          if (code === 410 || code === 404) {
            await supabase.from("push_subscriptions").update({ is_active: false }).eq("endpoint", s.endpoint);
            failedEndpoints.push(s.endpoint);
          }
        }
      }),
    );

    return new Response(JSON.stringify({ success: true, sent, failed, failedEndpoints }), { headers: corsHeaders });
  } catch (err) {
    const e = err as { message?: string };
    return new Response(JSON.stringify({ success: false, error: e?.message ?? String(err) }), { status: 500, headers: corsHeaders });
  }
});
