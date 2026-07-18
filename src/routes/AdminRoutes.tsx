import { Routes, Route } from "react-router-dom";

import { AdminProtectedRoute } from "@/features/admin/layout/AdminProtectedRoute";
import { AdminLayout } from "@/features/admin/layout/AdminLayout";
import RewardRedemptionsPage from "@/features/admin/rewards/pages/RewardRedemptionsPage";
import { RewardsCatalogPage } from "@/features/admin/rewards-crud/pages/RewardsCatalogPage";
import { UsersPage } from "@/features/admin/users/pages/UsersPage";
import { UserDetailPage } from "@/features/admin/users/pages/UserDetailPage";
import AdminDashboardPage from "@/features/admin/dashboard/pages/AdminDashboardPage";
import TransactionsPage from "@/features/admin/transactions/pages/TransactionsPage";
import { MissionsPage } from "@/features/admin/missions/pages/MissionsPage";
import { AnalyticsPage } from "@/features/admin/analytics/pages/AnalyticsPage";
import { SettingsPage } from "@/features/admin/settings/pages/SettingsPage";
import { BroadcastPage } from "@/features/admin/broadcast/pages/BroadcastPage";
import { CampaignOverviewPage } from "@/features/admin/campaigns/pages/CampaignOverviewPage";
import { CampaignDetailPage } from "@/features/admin/campaigns/pages/CampaignDetailPage";
import { RewardAnalyticsPage } from "@/features/admin/reward-analytics";

export function AdminRoutes() {
  return (
    <AdminProtectedRoute>

      <Routes>

        <Route
          element={<AdminLayout />}
        >

          <Route
            index
            element={<AdminDashboardPage />}
          />

          <Route
            path="reward-catalog"
            element={<RewardsCatalogPage />}
          />

          <Route
            path="rewards"
            element={<RewardRedemptionsPage />}
          />

          <Route
            path="users"
            element={<UsersPage />}
          />

          <Route
            path="users/:id"
            element={<UserDetailPage />}
          />
          
          <Route
            path="transactions"
            element={<TransactionsPage />}
          />

          <Route
            path="missions"
            element={<MissionsPage />}
          />

          <Route
            path="analytics"
            element={<AnalyticsPage />}
          />

          <Route
            path="broadcast"
            element={<BroadcastPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />
          
          <Route
            path="reward-analytics"
            element={<RewardAnalyticsPage />}
          />

          <Route
            path="campaigns"
            element={<CampaignOverviewPage />}
          />

          <Route
            path="campaigns/:slug"
            element={<CampaignDetailPage />}
          />
           
        </Route>

      </Routes>

    </AdminProtectedRoute>
  );
}