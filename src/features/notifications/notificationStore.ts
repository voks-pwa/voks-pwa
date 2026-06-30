import { create } from "zustand";

export type NotificationType =
  | "mission"
  | "reward"
  | "badge"
  | "system"
  | "wordpress";

export interface NotificationItem {
  id: string;

  type: NotificationType;

  title: string;

  message: string;

  reward?: number;

  progress?: number;

  missionId?: number;

  createdAt: number;

  read: boolean;
}

interface NotificationStore {
  notifications: NotificationItem[];

  unread: number;

  addNotification(
    notification: Omit<
      NotificationItem,
      "id" | "createdAt" | "read"
    >
  ): void;

  markAsRead(id: string): void;

  markAllAsRead(): void;

  removeNotification(id: string): void;

  clear(): void;
}

export const useNotificationStore =
create<NotificationStore>((set) => ({

  notifications: [],

  unread: 0,

  addNotification(notification) {

    const item: NotificationItem = {

      id: crypto.randomUUID(),

      createdAt: Date.now(),

      read: false,

      ...notification,

    };

    set((state) => ({

      notifications: [
        item,
        ...state.notifications,
      ],

      unread: state.unread + 1,

    }));

  },

  markAsRead(id) {

    set((state) => {

      const notifications =
        state.notifications.map((n) =>
          n.id === id
            ? {
                ...n,
                read: true,
              }
            : n
        );

      return {

        notifications,

        unread:
          notifications.filter(
            (n) => !n.read
          ).length,

      };

    });

  },

  markAllAsRead() {

    set((state) => ({

      notifications:
        state.notifications.map((n) => ({
          ...n,
          read: true,
        })),

      unread: 0,

    }));

  },

  removeNotification(id) {

    set((state) => {

      const notifications =
        state.notifications.filter(
          (n) => n.id !== id
        );

      return {

        notifications,

        unread:
          notifications.filter(
            (n) => !n.read
          ).length,

      };

    });

  },

  clear() {

    set({

      notifications: [],

      unread: 0,

    });

  },

}));