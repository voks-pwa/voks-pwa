import { createContext } from "react";
import type { NotificationStoreItem } from "../notificationStore";
import type { NotificationEvent } from "../types";

export interface NotificationContextValue {
  notifications: NotificationStoreItem[];
  unreadCount: number;
  dispatchEvent: (event: NotificationEvent) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);
