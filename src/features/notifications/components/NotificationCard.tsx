import { Flag, Megaphone, Trophy, Gift, TrendingUp, Radio, Percent, Users, UserCheck, Bell, Shield, X, Check, Archive } from "lucide-react";
import type { NotificationStoreItem } from "../notificationStore";
import type { NotificationCategory } from "../types";

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: typeof Bell; color: string; bg: string }> = {
  mission: { icon: Flag, color: "text-emerald-600", bg: "bg-emerald-100" },
  campaign: { icon: Megaphone, color: "text-amber-600", bg: "bg-amber-100" },
  achievement: { icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-100" },
  reward: { icon: Gift, color: "text-pink-600", bg: "bg-pink-100" },
  leaderboard: { icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
  live: { icon: Radio, color: "text-red-600", bg: "bg-red-100" },
  promo: { icon: Percent, color: "text-purple-600", bg: "bg-purple-100" },
  referral: { icon: Users, color: "text-cyan-600", bg: "bg-cyan-100" },
  profile: { icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-100" },
  system: { icon: Bell, color: "text-gray-600", bg: "bg-gray-100" },
  admin: { icon: Shield, color: "text-orange-600", bg: "bg-orange-100" },
};

function relativeTime(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationCard({
  notification,
  onMarkRead,
  onArchive,
  onRemove,
}: {
  notification: NotificationStoreItem;
  onMarkRead?: () => void;
  onArchive?: () => void;
  onRemove?: () => void;
}) {
  const config = CATEGORY_CONFIG[notification.category as NotificationCategory] ?? CATEGORY_CONFIG.system;
  const Icon = config.icon;

  return (
    <div className={`group flex gap-3 rounded-2xl p-4 transition ${notification.read ? "bg-white" : "bg-[#bda752]/5"}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${notification.read ? "text-gray-900" : "font-bold text-gray-900"}`}>
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{notification.message}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-[#bda752]" />
            )}
            <span className="whitespace-nowrap text-xs text-gray-400">{relativeTime(notification.created_at)}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {!notification.read && onMarkRead && (
            <button onClick={onMarkRead} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
              <Check className="h-3 w-3" /> Mark Read
            </button>
          )}
          {onArchive && (
            <button onClick={onArchive} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
              <Archive className="h-3 w-3" /> Archive
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
              <X className="h-3 w-3" /> Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
