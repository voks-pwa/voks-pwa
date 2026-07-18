import {
  Users,
  Star,
  Target,
  Gift,
  Radio,
  Calendar,
  CalendarCheck,
  CalendarRange,
  Clock,
  Headphones,
  Bell,
  Award,
  BadgeCheck,
  Podcast,
  Megaphone,
} from "lucide-react";

import type { DashboardStats } from "../types/dashboard";

interface Props {
  stats: DashboardStats;
}

export default function DashboardCards({ stats }: Props) {
  console.log("[DashboardCards] props.stats:", stats);

  const safe = (v: unknown): number => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const cards = [
    { slug: "total-users", title: "Total Users", value: safe(stats.users), icon: Users, color: "from-blue-500 to-blue-700" },
    { slug: "transactions", title: "Transactions", value: safe(stats.transactions), icon: Star, color: "from-yellow-500 to-orange-500" },
    { slug: "missions-completed", title: "Missions Completed", value: safe(stats.completedMissions), icon: Target, color: "from-green-500 to-green-700" },
    { slug: "reward-redemptions", title: "Reward Redemptions", value: safe(stats.rewardRedemptions), icon: Gift, color: "from-pink-500 to-red-500" },
    { slug: "missions-today", title: "Missions Today", value: safe(stats.missionsToday), icon: CalendarCheck, color: "from-emerald-500 to-teal-700" },
    { slug: "redeemed-today", title: "Redeemed Today", value: safe(stats.redemptionsToday), icon: Clock, color: "from-violet-500 to-purple-700" },
    { slug: "new-users-7d", title: "New Users (7d)", value: safe(stats.usersThisWeek), icon: Calendar, color: "from-cyan-500 to-blue-600" },
    { slug: "new-users-30d", title: "New Users (30d)", value: safe(stats.usersThisMonth), icon: CalendarRange, color: "from-indigo-500 to-indigo-700" },
    { slug: "pending-broadcasts", title: "Pending Broadcasts", value: safe(stats.pendingBroadcasts), icon: Radio, color: "from-rose-500 to-pink-600" },
    { slug: "current-listeners", title: "Current Listeners", value: safe(stats.currentListeners), icon: Headphones, color: "from-sky-500 to-cyan-600" },
    { slug: "total-broadcasts", title: "Total Broadcasts", value: safe(stats.totalBroadcasts), icon: Radio, color: "from-amber-500 to-yellow-600" },
    { slug: "notifications-sent", title: "Notifications Sent", value: safe(stats.totalNotifications), icon: Bell, color: "from-fuchsia-500 to-pink-600" },
    { slug: "unique-redeemers", title: "Unique Redeemers", value: safe(stats.totalRewards), icon: Award, color: "from-orange-500 to-red-600" },
    { slug: "total-missions-completed", title: "Missions Completed", value: safe(stats.totalMissionsCompleted), icon: BadgeCheck, color: "from-lime-500 to-green-600" },
    { slug: "podcasts-published", title: "Podcasts Published", value: safe(stats.podcastCount), icon: Podcast, color: "from-teal-500 to-emerald-600" },
    { slug: "promos-running", title: "Promos Running", value: safe(stats.promoCount), icon: Megaphone, color: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.slug}
            className={`rounded-3xl bg-linear-to-br ${card.color} p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{card.title}</p>
                <h2 className="mt-3 text-4xl font-black">
                  {card.value.toLocaleString()}
                </h2>
              </div>

              <div className="rounded-2xl bg-white/20 p-3">
                <Icon size={34} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
