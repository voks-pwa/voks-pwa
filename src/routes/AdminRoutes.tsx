import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

import { AdminProtectedRoute } from "@/features/admin/layout/AdminProtectedRoute";
import { AdminLayout } from "@/features/admin/layout/AdminLayout";

// ── Dashboard ──────────────────────────────────────────────────────────────

const AdminDashboardPage = lazy(() => import("@/features/admin/dashboard/pages/AdminDashboardPage"));

// ── Economy & Commerce ─────────────────────────────────────────────────────

const EconomyPage = lazy(() => import("@/features/admin/economy/pages/EconomyPage").then(m => ({ default: m.EconomyPage })));
const CommercePage = lazy(() => import("@/features/admin/commerce/pages/CommercePage"));
const MarketplacePage = lazy(() => import("@/features/admin/marketplace/pages/MarketplacePage"));
const PaymentsPage = lazy(() => import("@/features/admin/payments/pages/PaymentsPage"));
const SubscriptionPage = lazy(() => import("@/features/admin/subscription/pages/SubscriptionPage"));

// ── Rewards ────────────────────────────────────────────────────────────────

const RewardsCatalogPage = lazy(() => import("@/features/admin/rewards-crud/pages/RewardsCatalogPage").then(m => ({ default: m.RewardsCatalogPage })));
const RewardRedemptionsPage = lazy(() => import("@/features/admin/rewards/pages/RewardRedemptionsPage"));
const RewardAnalyticsPage = lazy(() => import("@/features/admin/reward-analytics").then(m => ({ default: m.RewardAnalyticsPage })));

// ── Missions ───────────────────────────────────────────────────────────────

const MissionsPage = lazy(() => import("@/features/admin/missions/pages/MissionsPage").then(m => ({ default: m.MissionsPage })));

// ── Users ──────────────────────────────────────────────────────────────────

const UsersPage = lazy(() => import("@/features/admin/users/pages/UsersPage").then(m => ({ default: m.UsersPage })));
const UserDetailPage = lazy(() => import("@/features/admin/users/pages/UserDetailPage").then(m => ({ default: m.UserDetailPage })));

// ── Analytics ──────────────────────────────────────────────────────────────

const AnalyticsPage = lazy(() => import("@/features/admin/analytics/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const ReportingPage = lazy(() => import("@/features/admin/analytics-reporting/pages/ReportingPage"));
const WalletAnalyticsPage = lazy(() => import("@/features/admin/analytics-wallet/pages/WalletAnalyticsPage"));

// ── Transactions ───────────────────────────────────────────────────────────

const TransactionsPage = lazy(() => import("@/features/admin/transactions/pages/TransactionsPage"));

// ── Campaigns ──────────────────────────────────────────────────────────────

const CampaignOverviewPage = lazy(() => import("@/features/admin/campaigns/pages/CampaignOverviewPage").then(m => ({ default: m.CampaignOverviewPage })));
const CampaignDetailPage = lazy(() => import("@/features/admin/campaigns/pages/CampaignDetailPage").then(m => ({ default: m.CampaignDetailPage })));

// ── System ─────────────────────────────────────────────────────────────────

const OperationsPage = lazy(() => import("@/features/admin/operations/pages/OperationsPage"));
const AutomationPage = lazy(() => import("@/features/admin/automation/pages/AutomationPage"));

// ── Communication ──────────────────────────────────────────────────────────

const BroadcastPage = lazy(() => import("@/features/admin/broadcast/pages/BroadcastPage").then(m => ({ default: m.BroadcastPage })));
const NotificationComposerPage = lazy(() => import("@/features/admin/notification/pages/NotificationComposerPage"));

// ── Content ────────────────────────────────────────────────────────────────

const RecommendationPage = lazy(() => import("@/features/admin/recommendation/pages/RecommendationPage"));
const KnowledgeBasePage = lazy(() => import("@/features/admin/knowledge/pages/KnowledgeBasePage"));

// ── Configuration ──────────────────────────────────────────────────────────

const SettingsPage = lazy(() => import("@/features/admin/settings/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const FeatureFlagsPage = lazy(() => import("@/features/admin/feature-flags/pages/FeatureFlagsPage"));
const AuditLogPage = lazy(() => import("@/features/admin/audit/pages/AuditLogPage"));

// ── Sponsor / Campaign Analytics (shared component) ────────────────────────

const SponsorAnalyticsPage = lazy(() =>
  import("@/pages/SponsorAnalyticsPage").then(m => ({ default: m.SponsorAnalyticsPage })),
);

export function AdminRoutes() {
  return (
    <AdminProtectedRoute>
      <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#bda752]" /></div>}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />

            {/* ── Economy & Commerce ── */}
            <Route path="economy" element={<EconomyPage />} />
            <Route path="commerce" element={<CommercePage />} />
            <Route path="commerce/products" element={<MarketplacePage />} />
            <Route path="commerce/payments" element={<PaymentsPage />} />
            <Route path="commerce/plans" element={<SubscriptionPage />} />

            {/* ── Rewards ── */}
            <Route path="rewards" element={<RewardRedemptionsPage />} />
            <Route path="rewards/catalog" element={<RewardsCatalogPage />} />
            <Route path="rewards/analytics" element={<RewardAnalyticsPage />} />

            {/* ── Missions ── */}
            <Route path="missions" element={<MissionsPage />} />

            {/* ── Users ── */}
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />

            {/* ── Analytics ── */}
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="analytics/reporting" element={<ReportingPage />} />
            <Route path="analytics/wallet" element={<WalletAnalyticsPage />} />

            {/* ── Transactions ── */}
            <Route path="transactions" element={<TransactionsPage />} />

            {/* ── Campaigns ── */}
            <Route path="campaigns" element={<CampaignOverviewPage />} />
            <Route path="campaigns/:slug" element={<CampaignDetailPage />} />
            <Route path="campaigns/:slug/analytics" element={<SponsorAnalyticsPage />} />

            {/* ── System ── */}
            <Route path="system" element={<OperationsPage />} />
            <Route path="automation" element={<AutomationPage />} />

            {/* ── Communication ── */}
            <Route path="broadcast" element={<BroadcastPage />} />
            <Route path="notification" element={<NotificationComposerPage />} />

            {/* ── Content ── */}
            <Route path="recommendation" element={<RecommendationPage />} />
            <Route path="knowledge" element={<KnowledgeBasePage />} />

            {/* ── Configuration ── */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="feature-flags" element={<FeatureFlagsPage />} />
            <Route path="audit" element={<AuditLogPage />} />

            {/* ── Backward-compat redirects ── */}
            <Route path="reward-catalog" element={<Navigate replace to="/admin/rewards/catalog" />} />
            <Route path="reward-analytics" element={<Navigate replace to="/admin/rewards/analytics" />} />
            <Route path="reporting" element={<Navigate replace to="/admin/analytics/reporting" />} />
            <Route path="wallet-analytics" element={<Navigate replace to="/admin/analytics/wallet" />} />
            <Route path="marketplace" element={<Navigate replace to="/admin/commerce/products" />} />
            <Route path="payments" element={<Navigate replace to="/admin/commerce/payments" />} />
            <Route path="subscription" element={<Navigate replace to="/admin/commerce/plans" />} />
            <Route path="operations" element={<Navigate replace to="/admin/system" />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminProtectedRoute>
  );
}
