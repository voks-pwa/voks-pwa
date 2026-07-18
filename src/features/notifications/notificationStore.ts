import { create } from "zustand";
import type { Notification } from "./types";

export type { Notification } from "./types";

export interface NotificationStoreItem {
  id: string;
  category: string;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  action_target?: string;
  payload?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  metadata?: {
    missionId?: number;
    reward?: number;
    progress?: number;
    campaignSlug?: string;
    rank?: number;
  };
}

interface NotificationStore {
  items: NotificationStoreItem[];
  unread: number;

  add(item: NotificationStoreItem): void;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  archive(id: string): void;
  remove(id: string): void;
  setFromSupabase(notifications: Notification[]): void;
  clear(): void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  items: [],
  unread: 0,

  add(item) {
    set((state) => ({
      items: [item, ...state.items],
      unread: state.unread + (item.read ? 0 : 1),
    }));
  },

  markAsRead(id) {
    set((state) => {
      const items = state.items.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        items,
        unread: items.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead() {
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
      unread: 0,
    }));
  },

  archive(id) {
    set((state) => {
      const items = state.items.filter((n) => n.id !== id);
      return {
        items,
        unread: items.filter((n) => !n.read).length,
      };
    });
  },

  remove(id) {
    set((state) => {
      const items = state.items.filter((n) => n.id !== id);
      return {
        items,
        unread: items.filter((n) => !n.read).length,
      };
    });
  },

  setFromSupabase(notifications) {
    const items: NotificationStoreItem[] = notifications.map((n) => ({
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
    }));
    set({
      items,
      unread: items.filter((n) => !n.read).length,
    });
  },

  clear() {
    set({ items: [], unread: 0 });
  },
}));
