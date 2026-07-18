import type { NotificationEvent, NotificationEventType } from "../types";
import { categoryForEvent, defaultTitle, defaultMessage } from "../types";
import { useNotificationStore, type NotificationStoreItem } from "../notificationStore";
import { insertNotification } from "../repositories/notificationRepository";

export interface DispatchResult {
  success: boolean;
  notification?: NotificationStoreItem;
  error?: string;
}

export async function dispatchEvent(event: NotificationEvent): Promise<DispatchResult> {
  if (!event.userId && !isSystemEvent(event.type)) {
    return { success: false, error: "userId required for user-specific notifications" };
  }

  const category = categoryForEvent(event.type);
  const title = event.title ?? defaultTitle(event.type);
  const message = event.message ?? defaultMessage(event.type, event.metadata);

  const storeItem: NotificationStoreItem = {
    id: crypto.randomUUID(),
    category,
    title,
    message,
    icon: event.image,
    image: event.image,
    action_target: event.actionTarget,
    payload: event.payload,
    read: false,
    created_at: new Date().toISOString(),
    metadata: event.metadata,
  };

  if (event.userId) {
    const dbNotification = await insertNotification({
      user_id: event.userId,
      category,
      event_type: event.type,
      title,
      message,
      image: event.image,
      action_target: event.actionTarget,
      payload: event.payload,
    });

    if (dbNotification) {
      storeItem.id = dbNotification.id;
    }
  }

  useNotificationStore.getState().add(storeItem);

  return { success: true, notification: storeItem };
}

function isSystemEvent(type: NotificationEventType): boolean {
  return type.startsWith("campaign_") || type === "system_maintenance" || type === "admin_broadcast";
}
