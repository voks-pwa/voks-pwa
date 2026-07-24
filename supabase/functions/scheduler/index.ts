import { serve } from "@std/http/server";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (_req: Request) => {
  console.log("[scheduler] ▶ request", _req.method, _req.url);

  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = _req.headers.get("x-scheduler-secret");
  const expectedSecret = Deno.env.get("SCHEDULER_SECRET") ?? "";
  if (expectedSecret && authHeader !== expectedSecret) {
    console.warn("[scheduler] unauthorized attempt");
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: corsHeaders },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const result = { jobs: 0, notifications: 0, expiredPending: 0, expiredVouchers: 0, expiredMarketplaceVouchers: 0, releasedStaleLocks: 0, errors: [] as string[] };

  try {
    console.log("[scheduler] running cleanup_expired_pending");
    const { data: cleanup, error: cleanupErr } = await supabase.rpc("cleanup_expired_pending");
    if (cleanupErr) {
      result.errors.push(`cleanup_expired_pending: ${cleanupErr.message}`);
    } else if (cleanup?.length > 0) {
      result.expiredPending = cleanup[0].count ?? 0;
    }

    console.log("[scheduler] running release_stale_locks");
    const { data: staleLocks, error: slErr } = await supabase.rpc("release_stale_locks");
    if (slErr) {
      result.errors.push(`release_stale_locks: ${slErr.message}`);
    } else {
      result.releasedStaleLocks = (staleLocks as { released_orders: number }[])?.[0]?.released_orders ?? 0;
    }

    console.log("[scheduler] running expire_vouchers");
    const { data: expiredV, error: vErr } = await supabase.rpc("expire_vouchers");
    if (vErr) {
      result.errors.push(`expire_vouchers: ${vErr.message}`);
    } else {
      result.expiredVouchers = (expiredV as number) ?? 0;
    }

    const { data: expiredMV, error: mvErr } = await supabase.rpc("expire_marketplace_vouchers");
    if (mvErr) {
      result.errors.push(`expire_marketplace_vouchers: ${mvErr.message}`);
    } else {
      result.expiredMarketplaceVouchers = (expiredMV as number) ?? 0;
    }

    console.log("[scheduler] running claim_due_jobs");
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

    console.log("[scheduler] running claim_notification_batch");
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
            const { data: subs } = await supabase
              .from("push_subscriptions")
              .select("endpoint, p256dh, auth")
              .eq("user_id", item.user_id)
              .eq("is_active", true);
            if (!subs || subs.length === 0) {
              result.errors.push(`push: no subscription for ${item.user_id}`);
            }
          } else if (item.channel === "EMAIL" && item.user_id) {
            // Email delivery — requires SMTP / Resend API key (set in env).
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

    console.log("[scheduler] ✔ completed, jobs:", result.jobs, "notifications:", result.notifications);
    return new Response(JSON.stringify({ success: true, ...result }), { headers: corsHeaders });
  } catch (e) {
    console.error("[scheduler] ✖ EXCEPTION:", e instanceof Error ? e.message : "unknown error");
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "unknown error", ...result }),
      { status: 500, headers: corsHeaders },
    );
  }
});
