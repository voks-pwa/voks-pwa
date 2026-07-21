import {
  createScheduledJobRpc,
  claimDueJobsRpc,
  markJobDoneRpc,
  markJobFailedRpc,
  enqueueNotificationRpc,
  claimNotificationBatchRpc,
  markNotificationSentRpc,
  markNotificationFailedRpc,
  requeueDeadRpc,
  getAllScheduledJobs,
  getAllQueueItems,
  getDeadQueueItems,
} from "../repositories/automationRepository";
import { dispatchEvent } from "@/features/notifications/services/eventDispatcher";
import type {
  ScheduledJob,
  NotificationQueueItem,
  AutomationActionResult,
  JobType,
  NotificationChannel,
} from "../types";

export async function scheduleJob(
  jobType: JobType,
  runAt: Date | string,
  options?: { referenceId?: string; payload?: Record<string, unknown>; maxAttempts?: number },
): Promise<AutomationActionResult> {
  const runAtStr = typeof runAt === "string" ? runAt : runAt.toISOString();
  return createScheduledJobRpc(jobType, runAtStr, options?.referenceId, options?.payload, options?.maxAttempts);
}

export async function scheduleMission(
  missionId: number,
  runAt: Date | string,
  payload?: Record<string, unknown>,
): Promise<AutomationActionResult> {
  return scheduleJob("MISSION_SCHEDULE", runAt, { referenceId: String(missionId), payload });
}

export async function scheduleCampaign(
  campaignSlug: string,
  runAt: Date | string,
  payload?: Record<string, unknown>,
): Promise<AutomationActionResult> {
  return scheduleJob("CAMPAIGN_SCHEDULE", runAt, { referenceId: campaignSlug, payload });
}

export async function enqueueNotification(
  channel: NotificationChannel,
  title: string,
  message: string,
  options?: {
    userId?: string;
    templateKey?: string;
    imageUrl?: string;
    deepLink?: string;
    payload?: Record<string, unknown>;
  },
): Promise<AutomationActionResult> {
  return enqueueNotificationRpc(
    channel,
    title,
    message,
    options?.userId,
    options?.templateKey,
    options?.imageUrl,
    options?.deepLink,
    options?.payload,
  );
}

export async function notifyInApp(
  userId: string,
  title: string,
  message: string,
  options?: { templateKey?: string; imageUrl?: string; deepLink?: string; payload?: Record<string, unknown> },
): Promise<AutomationActionResult> {
  return enqueueNotification("IN_APP", title, message, { userId, ...options });
}

export async function notifyPush(
  userId: string,
  title: string,
  message: string,
  options?: { templateKey?: string; imageUrl?: string; deepLink?: string; payload?: Record<string, unknown> },
): Promise<AutomationActionResult> {
  return enqueueNotification("PUSH", title, message, { userId, ...options });
}

export async function notifyEmail(
  userId: string,
  title: string,
  message: string,
  options?: { templateKey?: string; imageUrl?: string; deepLink?: string; payload?: Record<string, unknown> },
): Promise<AutomationActionResult> {
  return enqueueNotification("EMAIL", title, message, { userId, ...options });
}

export async function processNotificationQueue(limit = 50): Promise<{ processed: number; failed: number }> {
  const claimed = await claimNotificationBatchRpc(limit);
  if (!claimed.success || !Array.isArray(claimed.items)) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const item of claimed.items as NotificationQueueItem[]) {
    try {
      if (item.channel === "IN_APP" && item.user_id) {
        await dispatchEvent({
          type: "system_maintenance",
          userId: item.user_id,
          title: item.title,
          message: item.message,
          image: item.image_url || undefined,
          actionTarget: item.deep_link || undefined,
          payload: item.payload,
        });
      }
      await markNotificationSentRpc(item.id);
      processed += 1;
    } catch (err) {
      await markNotificationFailedRpc(item.id, err instanceof Error ? err.message : "dispatch failed");
      failed += 1;
    }
  }

  return { processed, failed };
}

export async function processDueJobs(limit = 50): Promise<{ processed: number; failed: number }> {
  const claimed = await claimDueJobsRpc(limit);
  if (!claimed.success || !Array.isArray(claimed.jobs)) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const job of claimed.jobs as ScheduledJob[]) {
    try {
      await handleJob(job);
      await markJobDoneRpc(job.id);
      processed += 1;
    } catch (err) {
      await markJobFailedRpc(job.id, err instanceof Error ? err.message : "job failed");
      failed += 1;
    }
  }

  return { processed, failed };
}

async function handleJob(job: ScheduledJob): Promise<void> {
  switch (job.job_type) {
    case "MISSION_SCHEDULE":
    case "CAMPAIGN_SCHEDULE":
    case "BROADCAST_SEND":
      if (job.payload && typeof job.payload === "object") {
        const p = job.payload as Record<string, unknown>;
        await enqueueNotification(
          "IN_APP",
          String(p.title ?? "Scheduled Event"),
          String(p.message ?? ""),
          { userId: typeof p.userId === "string" ? p.userId : undefined, payload: p },
        );
      }
      break;
    case "SUBSCRIPTION_GRACE":
    case "SUBSCRIPTION_EXPIRY":
    case "CUSTOM":
    default:
      break;
  }
}

export async function requeueDead(): Promise<number> {
  return requeueDeadRpc();
}

export async function getScheduledJobs(): Promise<ScheduledJob[]> {
  return getAllScheduledJobs();
}

export async function getQueueItems(): Promise<NotificationQueueItem[]> {
  return getAllQueueItems();
}

export async function getDeadItems(): Promise<NotificationQueueItem[]> {
  return getDeadQueueItems();
}
