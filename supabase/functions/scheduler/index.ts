import { serve } from "@std/http/server";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (_req: Request) => {
  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const result = { jobs: 0, notifications: 0, errors: [] as string[] };

  try {
    // 1. Claim + process due scheduled jobs
    const { data: jobs, error: jobErr } = await supabase.rpc("claim_due_jobs", { p_limit: 100 });
    if (jobErr) {
      result.errors.push(`claim_due_jobs: ${jobErr.message}`);
    } else if (jobs?.success && Array.isArray(jobs.jobs)) {
      for (const job of jobs.jobs) {
        try {
          if (job.payload && typeof job.payload === "object") {
            const p = job.payload as Record<string, unknown>;
            if (p.title && p.message) {
              await supabase.rpc("enqueue_notification", {
                p_channel: "IN_APP",
                p_title: String(p.title),
                p_message: String(p.message),
                p_user_id: typeof p.userId === "string" ? p.userId : null,
                p_payload: p,
              });
            }
          }
          await supabase.rpc("mark_job_done", { p_job_id: job.id });
        } catch (e) {
          await supabase.rpc("mark_job_failed", {
            p_job_id: job.id,
            p_error: e instanceof Error ? e.message : "job failed",
          });
        }
      }
      result.jobs = jobs.jobs.length;
    }

    // 2. Claim + process notification queue (retry-safe, dead-letter)
    const { data: batch, error: qErr } = await supabase.rpc("claim_notification_batch", { p_limit: 100 });
    if (qErr) {
      result.errors.push(`claim_notification_batch: ${qErr.message}`);
    } else if (batch?.success && Array.isArray(batch.items)) {
      for (const item of batch.items) {
        try {
          if (item.channel === "IN_APP" && item.user_id) {
            await supabase.from("notifications").insert({
              user_id: item.user_id,
              category: "system",
              event_type: "system_maintenance",
              title: item.title,
              message: item.message,
              image: item.image_url || null,
              action_target: item.deep_link || null,
              payload: item.payload,
            });
          } else if (item.channel === "PUSH" && item.user_id) {
            // Web Push delivery — requires VAPID keys + web-push lib (set in env).
            // Integration point: fetch push_subscriptions for user_id and send via webpush.
            // No-op when keys absent; marked SENT so queue progresses in dev.
            const { data: subs } = await supabase
              .from("push_subscriptions")
              .select("endpoint, p256dh, auth")
              .eq("user_id", item.user_id)
              .eq("is_active", true);
            if (!subs || subs.length === 0) {
              result.errors.push(`push: no subscription for ${item.user_id}`);
            }
            // TODO: dispatch webpush payload to each subscription when VAPID keys configured
          } else if (item.channel === "EMAIL" && item.user_id) {
            // Email delivery — requires SMTP / Resend API key (set in env).
            // Integration point: send via email provider.
            // TODO: send email when provider configured
          }
          await supabase.rpc("mark_notification_sent", { p_queue_id: item.id });
        } catch (e) {
          await supabase.rpc("mark_notification_failed", {
            p_queue_id: item.id,
            p_error: e instanceof Error ? e.message : "dispatch failed",
          });
        }
      }
      result.notifications = batch.items.length;
    }

    return new Response(JSON.stringify({ success: true, ...result }), { headers: corsHeaders });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "unknown error", ...result }),
      { status: 500, headers: corsHeaders },
    );
  }
});
