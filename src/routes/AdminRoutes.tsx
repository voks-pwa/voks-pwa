import { Routes, Route } from "react-router-dom";

import { AdminProtectedRoute } from "@/features/admin/layout/AdminProtectedRoute";
import { AdminLayout } from "@/features/admin/layout/AdminLayout";

import { DashboardPage } from "@/features/admin/dashboard/pages/DashboardPage";
import { RewardRedemptionsPage } from "@/features/admin/rewards/pages/RewardRedemptionsPage";
import { UsersPage } from "@/features/admin/users/pages/UsersPage";

export function AdminRoutes() {
  return (
    <AdminProtectedRoute>

      <Routes>

        <Route
          element={<AdminLayout />}
        >

          <Route
            index
            element={<DashboardPage />}
          />

          <Route
            path="reward-redemptions"
            element={<RewardRedemptionsPage />}
          />

          <Route
            path="users"
            element={<UsersPage />}
          />

        </Route>

      </Routes>

    </AdminProtectedRoute>
  );
}