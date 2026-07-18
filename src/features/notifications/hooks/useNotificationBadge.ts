import { useNotificationContext } from "../context/useNotificationContext";

export function useNotificationBadge() {
  const ctx = useNotificationContext();

  return {
    count: ctx.unreadCount,
    hasUnread: ctx.unreadCount > 0,
  };
}
