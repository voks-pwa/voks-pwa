export type JobType =
  | "MISSION_SCHEDULE"
  | "CAMPAIGN_SCHEDULE"
  | "SUBSCRIPTION_GRACE"
  | "SUBSCRIPTION_EXPIRY"
  | "BROADCAST_SEND"
  | "CUSTOM";

export type JobStatus = "PENDING" | "CLAIMED" | "DONE" | "FAILED";

export type NotificationChannel = "IN_APP" | "PUSH" | "EMAIL" | "BROADCAST";

export type QueueStatus = "PENDING" | "CLAIMED" | "SENT" | "FAILED" | "DEAD";

export interface ScheduledJob {
  id: string;
  job_type: JobType;
  reference_id: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  run_at: string;
  claimed_at: string | null;
  attempts: number;
  max_attempts: number;
  last_error: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueueItem {
  id: string;
  channel: NotificationChannel;
  user_id: string | null;
  template_key: string;
  title: string;
  message: string;
  image_url: string;
  deep_link: string;
  payload: Record<string, unknown>;
  status: QueueStatus;
  attempts: number;
  max_attempts: number;
  next_retry_at: string;
  last_error: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationActionResult {
  success: boolean;
  error?: string;
  job_id?: string;
  queue_id?: string;
  jobs?: unknown[];
  items?: unknown[];
  status?: string;
}
