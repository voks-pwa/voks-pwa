import { supabase } from "@/lib/supabase";
import type { Notification, NotificationEventType, NotificationCategory } from "../types";

const NOTIFICATIONS_LIMIT = 50;

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(NOTIFICATIONS_LIMIT);

  if (error) {
    console.error("[NOTIFICATION_REPO] fetch error", error);
    console.error("[NOTIFICATION_REPO] fetch error detail", JSON.stringify(error, null, 2));
    return [];
  }

  return (data ?? []).map(toNotification);
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)
    .is("archived_at", null);

  if (error) {
    console.error("[NOTIFICATION_REPO] unread count error", error);
    console.error("[NOTIFICATION_REPO] unread count error detail", JSON.stringify(error, null, 2));
    return 0;
  }

  return count ?? 0;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("[NOTIFICATION_REPO] markAsRead error", error);
    console.error("[NOTIFICATION_REPO] markAsRead error detail", JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("[NOTIFICATION_REPO] markAllAsRead error", error);
    console.error("[NOTIFICATION_REPO] markAllAsRead error detail", JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function archiveNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("[NOTIFICATION_REPO] archive error", error);
    console.error("[NOTIFICATION_REPO] archive error detail", JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ archived_at: new Date().toISOString(), dismissed: true })
    .eq("id", notificationId);

  if (error) {
    console.error("[NOTIFICATION_REPO] delete error", error);
    console.error("[NOTIFICATION_REPO] delete error detail", JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function insertNotification(notification: {
  user_id: string;
  category: string;
  event_type: NotificationEventType;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  action_type?: string;
  action_target?: string;
  payload?: Record<string, unknown>;
}): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: notification.user_id,
      type: notification.category,
      category: notification.category,
      event_type: notification.event_type,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      image_url: notification.image,
      action_type: notification.action_type,
      deep_link: notification.action_target,
      payload: notification.payload,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[NOTIFICATION_REPO] insert error", error);
    console.error("[NOTIFICATION_REPO] insert error detail", JSON.stringify(error, null, 2));
    return null;
  }

  return toNotification(data);
}

export function subscribeToNotifications(userId: string, onNew: (notification: Notification) => void): () => void {
  const channel = supabase
    .channel("notifications-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notif = toNotification(payload.new as Record<string, unknown>);
        if (notif) onNew(notif);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

function toNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id ?? ""),
    user_id: String(row.user_id ?? ""),
    category: ((row.category as string) ?? (row.type as string) ?? "system") as NotificationCategory,
    event_type: (row.event_type as NotificationEventType) ?? "system_maintenance",
    title: String(row.title ?? ""),
    message: String(row.message ?? ""),
    icon: row.icon as string | undefined,
    image: (row.image_url as string) ?? (row.image as string | undefined),
    action_type: row.action_type as string | undefined,
    action_target: (row.deep_link as string) ?? (row.action_target as string | undefined),
    payload: row.payload as Record<string, unknown> | undefined,
    read: Boolean(row.read),
    read_at: row.read_at as string | undefined,
    dismissed: Boolean(row.dismissed),
    archived_at: row.archived_at as string | undefined,
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}
