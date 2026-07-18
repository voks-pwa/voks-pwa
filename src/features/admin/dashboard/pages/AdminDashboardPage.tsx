import DashboardCards from "../components/DashboardCards";
import TopUsersTable from "../components/TopUsersTable";
import RecentActivity from "../components/RecentActivity";

import { useDashboard } from "../hooks/useDashboard";

export default function AdminDashboardPage() {

  const {
    data,
    isLoading,
    error,
  } = useDashboard();

  console.log("[AdminDashboardPage] error:", error);
  console.log("[AdminDashboardPage] data:", data);
  console.log("[AdminDashboardPage] data.stats:", data?.stats);
  console.log("[AdminDashboardPage] data.topUsers:", data?.topUsers);
  console.log("[AdminDashboardPage] data.recentActivity:", data?.recentActivity);

  if (isLoading) {
    return (
      <div className="p-8">
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load dashboard.
      </div>
    );
  }

  return (
  <div className="space-y-8 p-8">

    <div>

      <h1 className="text-3xl font-black">
        Admin Dashboard
      </h1>

      <p className="text-gray-500">
        Welcome back, Admin.
      </p>

    </div>

    <DashboardCards
      stats={data.stats}
    />

    <div className="grid gap-8 xl:grid-cols-3">

      <div className="xl:col-span-2">

        <TopUsersTable
          users={data.topUsers}
        />

      </div>

      <div>

        <RecentActivity
          activities={data.recentActivity}
        />

      </div>

    </div>

  </div>
);
}