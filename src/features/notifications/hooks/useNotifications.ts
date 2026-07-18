import { useNotificationContext } from "../context/useNotificationContext";
import type { NotificationEvent } from "../types";

export function useNotifications() {
  const ctx = useNotificationContext();

  return {
    notifications: ctx.notifications,
    unreadCount: ctx.unreadCount,
    dispatchEvent: (event: NotificationEvent) => ctx.dispatchEvent(event),
    markAsRead: (id: string) => ctx.markAsRead(id),
    markAllAsRead: () => ctx.markAllAsRead(),
    archive: (id: string) => ctx.archive(id),
    remove: (id: string) => ctx.remove(id),
    refresh: () => ctx.refresh(),
  };
}
