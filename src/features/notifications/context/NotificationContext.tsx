import { useEffect, useCallback, useRef } from "react";
import { useNotificationStore } from "../notificationStore";
import { dispatchEvent } from "../services/eventDispatcher";
import {
  fetchNotifications,
  markAsRead as repoMarkRead,
  markAllAsRead as repoMarkAllRead,
  archiveNotification,
  deleteNotification,
  subscribeToNotifications,
} from "../repositories/notificationRepository";
import { NotificationContext } from "./NotificationContextValue";
import type { NotificationEvent } from "../types";

export function NotificationProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const store = useNotificationStore;
  const items = store((s) => s.items);
  const unreadCount = store((s) => s.unread);

  const loadStarted = useRef(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const notifs = await fetchNotifications(userId);
    store.getState().setFromSupabase(notifs);
  }, [userId, store]);

  useEffect(() => {
    if (loadStarted.current) return;
    loadStarted.current = true;
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToNotifications(userId, (n) => {
      store.getState().add({
        id: n.id,
        category: n.category,
        title: n.title,
        message: n.message,
        icon: n.icon,
        image: n.image,
        action_target: n.action_target,
        payload: n.payload,
        read: n.read,
        created_at: n.created_at,
      });
    });
    return unsub;
  }, [userId, store]);

  const handleDispatch = useCallback(async (event: NotificationEvent) => {
    await dispatchEvent(event);
  }, []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    store.getState().markAsRead(id);
    await repoMarkRead(id);
  }, [store]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;
    store.getState().markAllAsRead();
    await repoMarkAllRead(userId);
  }, [userId, store]);

  const handleArchive = useCallback(async (id: string) => {
    store.getState().archive(id);
    await archiveNotification(id);
  }, [store]);

  const handleRemove = useCallback(async (id: string) => {
    store.getState().remove(id);
    await deleteNotification(id);
  }, [store]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: items,
        unreadCount,
        dispatchEvent: handleDispatch,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        archive: handleArchive,
        remove: handleRemove,
        refresh: load,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
