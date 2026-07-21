import { supabase } from "@/lib/supabase";
import type {
  ScheduledJob,
  NotificationQueueItem,
  AutomationActionResult,
  JobType,
  NotificationChannel,
} from "../types";

export async function createScheduledJobRpc(
  jobType: JobType,
  runAt: string,
  referenceId?: string,
  payload?: Record<string, unknown>,
  maxAttempts?: number,
): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("create_scheduled_job", {
    p_job_type: jobType,
    p_run_at: runAt,
    p_reference_id: referenceId ?? "",
    p_payload: payload ?? {},
    p_max_attempts: maxAttempts ?? 3,
  });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function claimDueJobsRpc(limit?: number): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("claim_due_jobs", { p_limit: limit ?? 50 });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function markJobDoneRpc(jobId: string): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("mark_job_done", { p_job_id: jobId });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function markJobFailedRpc(jobId: string, errorMsg?: string): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("mark_job_failed", { p_job_id: jobId, p_error: errorMsg ?? "" });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function enqueueNotificationRpc(
  channel: NotificationChannel,
  title: string,
  message: string,
  userId?: string,
  templateKey?: string,
  imageUrl?: string,
  deepLink?: string,
  payload?: Record<string, unknown>,
): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("enqueue_notification", {
    p_channel: channel,
    p_title: title,
    p_message: message,
    p_user_id: userId ?? null,
    p_template_key: templateKey ?? "",
    p_image_url: imageUrl ?? "",
    p_deep_link: deepLink ?? "",
    p_payload: payload ?? {},
  });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function claimNotificationBatchRpc(limit?: number): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("claim_notification_batch", { p_limit: limit ?? 50 });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function markNotificationSentRpc(queueId: string): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("mark_notification_sent", { p_queue_id: queueId });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function markNotificationFailedRpc(queueId: string, errorMsg?: string): Promise<AutomationActionResult> {
  const { data, error } = await supabase.rpc("mark_notification_failed", { p_queue_id: queueId, p_error: errorMsg ?? "" });
  if (error) return { success: false, error: error.message };
  return data as AutomationActionResult;
}

export async function requeueDeadRpc(): Promise<number> {
  const { data, error } = await supabase.rpc("requeue_dead_notifications");
  if (error) return 0;
  return data as number;
}

export async function getAllScheduledJobs(): Promise<ScheduledJob[]> {
  const { data, error } = await supabase
    .from("scheduled_jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getAllQueueItems(): Promise<NotificationQueueItem[]> {
  const { data, error } = await supabase
    .from("notification_queue")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getDeadQueueItems(): Promise<NotificationQueueItem[]> {
  const { data, error } = await supabase
    .from("notification_queue")
    .select("*")
    .eq("status", "DEAD")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
