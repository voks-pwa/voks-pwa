import { useMemo } from "react";
import { Bell } from "lucide-react";
import { NotificationCard } from "./NotificationCard";
import type { NotificationStoreItem } from "../notificationStore";

interface GroupedNotifications {
  unread: NotificationStoreItem[];
  today: NotificationStoreItem[];
  yesterday: NotificationStoreItem[];
  earlier: NotificationStoreItem[];
}

function groupNotifications(items: NotificationStoreItem[]): GroupedNotifications {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toDateString();

  const groups: GroupedNotifications = { unread: [], today: [], yesterday: [], earlier: [] };

  for (const item of items) {
    const date = new Date(item.created_at);
    const dateStr = date.toDateString();

    if (!item.read) {
      groups.unread.push(item);
    } else if (dateStr === todayStr) {
      groups.today.push(item);
    } else if (dateStr === yesterdayStr) {
      groups.yesterday.push(item);
    } else {
      groups.earlier.push(item);
    }
  }

  return groups;
}

export function NotificationList({
  items,
  onMarkRead,
  onMarkAllAsRead,
  onArchive,
  onRemove,
}: {
  items: NotificationStoreItem[];
  onMarkRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onArchive?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const groups = useMemo(() => groupNotifications(items), [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell className="h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg font-bold text-gray-500">No notifications yet</p>
        <p className="mt-1 text-sm text-gray-400">Complete missions and achievements to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.unread.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Unread</h3>
            {onMarkAllAsRead && (
              <button onClick={onMarkAllAsRead} className="text-xs font-semibold text-[#bda752] hover:underline">
                Mark All Read
              </button>
            )}
          </div>
          <div className="space-y-1">
            {groups.unread.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={onMarkRead ? () => onMarkRead(n.id) : undefined}
                onArchive={onArchive ? () => onArchive(n.id) : undefined}
                onRemove={onRemove ? () => onRemove(n.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {groups.today.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-500">Today</h3>
          <div className="space-y-1">
            {groups.today.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onArchive={onArchive ? () => onArchive(n.id) : undefined}
                onRemove={onRemove ? () => onRemove(n.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {groups.yesterday.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-500">Yesterday</h3>
          <div className="space-y-1">
            {groups.yesterday.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onArchive={onArchive ? () => onArchive(n.id) : undefined}
                onRemove={onRemove ? () => onRemove(n.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {groups.earlier.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-500">Earlier</h3>
          <div className="space-y-1">
            {groups.earlier.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onArchive={onArchive ? () => onArchive(n.id) : undefined}
                onRemove={onRemove ? () => onRemove(n.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
