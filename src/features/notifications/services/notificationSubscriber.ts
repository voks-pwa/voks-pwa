import { dispatchEvent } from "./eventDispatcher";
import type { NotificationEvent, NotificationEventType } from "../types";
import type { ActionEvent } from "@/core/action-engine/types";

const EVENT_MAP: Partial<Record<string, NotificationEventType>> = {
  MISSION_COMPLETE: "mission_completed",
  ACHIEVEMENT_UNLOCK: "achievement_unlocked",
  MILESTONE_UNLOCK: "achievement_unlocked",
  REWARD_CLAIM: "reward_redeemed",
  REWARD_REDEEM: "reward_redeemed",
  LOW_STOCK: "admin_broadcast",
};

const recentMap = new Map<string, number>();
const SPAM_MS = 30_000;

function isSpam(key: string): boolean {
  const now = Date.now();
  const last = recentMap.get(key);
  if (last && now - last < SPAM_MS) return true;
  recentMap.set(key, now);
  return false;
}

function mkSpamKey(type: NotificationEventType, userId?: string, extra?: string): string {
  return `${type}:${userId ?? "system"}:${extra ?? ""}`;
}

interface QueueItem {
  type: NotificationEventType;
  userId?: string;
  metadata?: Record<string, unknown>;
  event: NotificationEvent;
}

const pendingQueue = new Map<string, QueueItem>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_MS = 800;

function groupKey(type: NotificationEventType, userId?: string, meta?: Record<string, unknown>): string {
  if (type === "mission_completed") return `mission:${userId}:${String(meta?.missionId ?? "")}`;
  if (type === "achievement_unlocked" || type === "reward_redeemed") return `xp:${userId}`;
  return `${type}:${userId ?? "system"}`;
}

function scheduleFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, FLUSH_MS);
}

async function flush(): Promise<void> {
  flushTimer = null;
  const items = [...pendingQueue.values()];
  pendingQueue.clear();
  for (const item of items) {
    if (isSpam(mkSpamKey(item.type, item.userId, String(item.metadata?.missionId ?? "")))) continue;
    await dispatchEvent(item.event);
  }
}

function enqueue(event: NotificationEvent, meta?: Record<string, unknown>): void {
  const key = groupKey(event.type, event.userId, meta);
  const existing = pendingQueue.get(key);

  if (existing && (event.type === "achievement_unlocked" || event.type === "reward_redeemed")) {
    const existingReward = (existing.metadata?.reward as number) ?? 0;
    const newReward = (meta?.reward as number) ?? 0;
    existing.metadata = { ...existing.metadata, reward: existingReward + newReward };
    existing.event.metadata = existing.metadata;
    return;
  }

  if (existing && event.type === "mission_completed") return;

  pendingQueue.set(key, { type: event.type, userId: event.userId, metadata: meta, event });
  scheduleFlush();
}

export function notificationConsumer(event: ActionEvent): void {
  const notifType = EVENT_MAP[event.name];
  if (!notifType) return;

  let meta: Record<string, unknown> | undefined;

  switch (event.name) {
    case "MISSION_COMPLETE": {
      const p = event.payload as { mission_id: number; reward_vxp: number } | undefined;
      meta = { missionId: p?.mission_id, reward: p?.reward_vxp ?? 0 };
      break;
    }
    case "ACHIEVEMENT_UNLOCK": {
      const p = event.payload as { slug: string; title: string; reward_vxp: number } | undefined;
      meta = { reward: p?.reward_vxp ?? 0 };
      break;
    }
    case "MILESTONE_UNLOCK": {
      const p = event.payload as { key: string; name: string; reward_vxp: number } | undefined;
      meta = { reward: p?.reward_vxp ?? 0 };
      break;
    }
    case "REWARD_CLAIM": {
      const p = event.payload as { streak_day: number; reward_vxp: number } | undefined;
      meta = { reward: p?.reward_vxp ?? 0, streakDay: p?.streak_day };
      break;
    }
    case "REWARD_REDEEM": {
      const p = event.payload as { redeem_id: string; reward_id: number; reward_title: string; required_vxp: number; status: string } | undefined;
      meta = { reward: p?.required_vxp ?? 0, rewardId: p?.reward_id, rewardTitle: p?.reward_title };
      break;
    }
    case "LOW_STOCK": {
      const p = event.payload as { reward_id: number; current_stock: number; warning_stock: number } | undefined;
      meta = { rewardId: p?.reward_id, currentStock: p?.current_stock, warningStock: p?.warning_stock };
      break;
    }
  }

  const notifEvent: NotificationEvent = { type: notifType, userId: event.userId, metadata: meta };
  enqueue(notifEvent, meta);
}

export function systemNotification(event: NotificationEvent): void {
  enqueue(event, event.metadata);
}
