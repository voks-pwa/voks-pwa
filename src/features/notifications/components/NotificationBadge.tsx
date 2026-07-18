import { Bell } from "lucide-react";
import { useNotificationBadge } from "../hooks/useNotificationBadge";

export function NotificationBadge({ size = 20, className }: { size?: number; className?: string }) {
  const { hasUnread, count } = useNotificationBadge();

  return (
    <div className={`relative ${className ?? ""}`}>
      <Bell size={size} />
      {hasUnread && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}
