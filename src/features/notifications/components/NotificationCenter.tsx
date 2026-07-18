import { useState, useMemo } from "react";
import { CheckCheck, Filter } from "lucide-react";
import { NotificationList } from "./NotificationList";
import { useNotifications } from "../hooks/useNotifications";

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mission", label: "Missions" },
  { value: "achievement", label: "Achievements" },
  { value: "reward", label: "Rewards" },
  { value: "campaign", label: "Campaigns" },
  { value: "system", label: "System" },
];

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, archive, remove, refresh } = useNotifications();
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return notifications;
    return notifications.filter((n) => n.category === categoryFilter);
  }, [notifications, categoryFilter]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#bda752] px-2.5 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100"
            >
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100"
          >
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button
            onClick={refresh}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                categoryFilter === f.value
                  ? "bg-[#bda752] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <NotificationList
        items={filtered}
        onMarkRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onArchive={archive}
        onRemove={remove}
      />
    </div>
  );
}
