export type { NotificationCategory, NotificationEventType, NotificationState, NotificationEvent, Notification } from "./types";
export { categoryForEvent, defaultTitle, defaultMessage, CATEGORY_ICONS } from "./types";

export { useNotificationStore } from "./notificationStore";
export type { NotificationStoreItem } from "./notificationStore";

export { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, archiveNotification, deleteNotification, insertNotification, subscribeToNotifications } from "./repositories/notificationRepository";

export { dispatchEvent } from "./services/eventDispatcher";
export type { DispatchResult } from "./services/eventDispatcher";

export { notificationConsumer, systemNotification } from "./services/notificationSubscriber";

export { NotificationProvider } from "./context/NotificationContext";
export { useNotificationContext } from "./context/useNotificationContext";
export type { NotificationContextValue } from "./context/NotificationContextValue";

export { useNotifications } from "./hooks/useNotifications";
export { useNotificationBadge } from "./hooks/useNotificationBadge";

export { registerPush, unregisterPush, listMyPushSubscriptions, registerBrowserPush } from "./services/pushSubscriptionService";
export type { PushSubscriptionRecord } from "./repositories/pushSubscriptionRepository";
export { useMyPushSubscriptions, useRegisterPush, useUnregisterPush, useRegisterBrowserPush } from "./hooks/usePushSubscription";
export { NotificationBadge } from "./components/NotificationBadge";
export { NotificationList } from "./components/NotificationList";
export { NotificationCard } from "./components/NotificationCard";
