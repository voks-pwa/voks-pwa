import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { EmptyLayout } from "@/layouts/EmptyLayout";

import { HomePage } from "@/pages/HomePage";
import { MorePage } from "@/pages/MorePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { LoginPage } from "@/pages/LoginPage";
import { FeatureGuard } from "@/components/ui/FeatureGuard";

const ProgramsPage = lazy(() =>
  import("@/pages/ProgramsPage").then((m) => ({ default: m.ProgramsPage })),
);
const ProgramDetailPage = lazy(() =>
  import("@/pages/ProgramDetailPage").then((m) => ({ default: m.ProgramDetailPage })),
);
const AnnouncersPage = lazy(() =>
  import("@/pages/AnnouncersPage").then((m) => ({ default: m.AnnouncersPage })),
);
const AnnouncerDetailPage = lazy(() =>
  import("@/pages/AnnouncerDetailPage").then((m) => ({ default: m.AnnouncerDetailPage })),
);
const SchedulePage = lazy(() =>
  import("@/pages/SchedulePage").then((m) => ({ default: m.SchedulePage })),
);
const LiveStudioPage = lazy(() =>
  import("@/pages/LiveStudioPage").then((m) => ({ default: m.LiveStudioPage })),
);
const VoksPlusPage = lazy(() =>
  import("@/pages/VoksPlusPage").then((m) => ({ default: m.VoksPlusPage })),
);
const VoksPlusDetailPage = lazy(() =>
  import("@/pages/VoksPlusDetailPage").then((m) => ({ default: m.VoksPlusDetailPage })),
);
const SearchPage = lazy(() =>
  import("@/pages/SearchPage").then((m) => ({ default: m.SearchPage })),
);
const NotificationsPage = lazy(() =>
  import("@/pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })),
);
const NotificationDetailPage = lazy(() =>
  import("@/pages/NotificationDetailPage").then((m) => ({ default: m.NotificationDetailPage })),
);
const PromoDetailPage = lazy(() =>
  import("@/pages/PromoDetailPage").then((m) => ({ default: m.PromoDetailPage })),
);
const PromoListPage = lazy(() =>
  import("@/pages/PromoListPage").then((m) => ({ default: m.PromoListPage })),
);
const MissionsPage = lazy(() =>
  import("@/pages/MissionsPage").then((m) => ({ default: m.MissionsPage })),
);
const MissionDetailPage = lazy(() =>
  import("@/pages/MissionDetailPage").then((m) => ({ default: m.MissionDetailPage })),
);
const RewardStorePage = lazy(() =>
  import("@/pages/RewardStorePage").then((m) => ({ default: m.RewardStorePage })),
);
const RewardHistoryPage = lazy(() =>
  import("@/features/rewards/pages/RewardHistoryPage").then((m) => ({ default: m.RewardHistoryPage })),
);
const RewardDetailPage = lazy(() =>
  import("@/features/rewards/pages/RewardDetailPage").then((m) => ({ default: m.RewardDetailPage })),
);
const LeaderboardPage = lazy(() =>
  import("@/features/leaderboard/pages/LeaderboardPage").then((m) => ({ default: m.LeaderboardPage })),
);
const CampaignsPage = lazy(() =>
  import("@/pages/CampaignsPage").then((m) => ({ default: m.CampaignsPage })),
);
const CampaignDetailPage = lazy(() =>
  import("@/pages/CampaignDetailPage").then((m) => ({ default: m.CampaignDetailPage })),
);
const SponsorAnalyticsPage = lazy(() =>
  import("@/pages/SponsorAnalyticsPage").then((m) => ({ default: m.SponsorAnalyticsPage })),
);
const DeveloperMissionSandbox = lazy(() =>
  import("@/pages/DeveloperMissionSandbox").then((m) => ({ default: m.default })),
);
const AdminRoutes = lazy(() =>
  import("./AdminRoutes").then((m) => ({ default: m.AdminRoutes })),
);

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#bda752]" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/* semua page */

export function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/programs"
          element={
            <Lazy>
              <ProgramsPage />
            </Lazy>
          }
        />
        <Route
          path="/programs/:slug"
          element={
            <Lazy>
              <ProgramDetailPage />
            </Lazy>
          }
        />
        <Route
          path="/announcers"
          element={
            <Lazy>
              <AnnouncersPage />
            </Lazy>
          }
        />
        <Route
          path="/announcers/:slug"
          element={
            <Lazy>
              <AnnouncerDetailPage />
            </Lazy>
          }
        />
        <Route
          path="/schedule"
          element={
            <Lazy>
              <SchedulePage />
            </Lazy>
          }
        />
        <Route
          path="/live"
          element={
            <Lazy>
              <LiveStudioPage />
            </Lazy>
          }
        />
        <Route
          path="/plus"
          element={
            <Lazy>
              <VoksPlusPage />
            </Lazy>
          }
        />
        <Route
          path="/plus/:slug"
          element={
            <Lazy>
              <VoksPlusDetailPage />
            </Lazy>
          }
        />
        <Route
          path="/search"
          element={
            <Lazy>
              <SearchPage />
            </Lazy>
          }
        />
        <Route
          path="/notifications"
          element={
            <Lazy>
              <NotificationsPage />
            </Lazy>
          }
        />
        <Route
          path="/notifications/:id"
          element={
            <Lazy>
              <NotificationDetailPage />
            </Lazy>
          }
        />
        <Route
          path="/promo"
          element={
            <Lazy>
              <PromoListPage />
            </Lazy>
          }
        />
        <Route
          path="/promo/:slug"
          element={
            <Lazy>
              <PromoDetailPage />
            </Lazy>
          }
        />

        <Route path="/more" element={<MorePage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/missions"
          element={
            <Lazy>
              <FeatureGuard feature="mission" title="Mission Center">
                <MissionsPage />
              </FeatureGuard>
            </Lazy>
          }
        />

        <Route
          path="/missions/:id"
          element={
            <Lazy>
              <FeatureGuard feature="mission" title="Mission Center">
                <MissionDetailPage />
              </FeatureGuard>
            </Lazy>
          }
        />

        <Route
          path="/reward-store"
          element={
            <Lazy>
              <FeatureGuard feature="reward" title="Reward Store">
                <RewardStorePage />
              </FeatureGuard>
            </Lazy>
          }
        />

        <Route
          path="/reward-store/:slug"
          element={
            <Lazy>
              <FeatureGuard feature="reward" title="Reward Store">
                <RewardDetailPage />
              </FeatureGuard>
            </Lazy>
          }
        />

        <Route
          path="/reward-history"
          element={
            <Lazy>
              <FeatureGuard feature="reward" title="Reward History">
                <RewardHistoryPage />
              </FeatureGuard>
            </Lazy>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <Lazy>
              <LeaderboardPage />
            </Lazy>
          }
        />

        <Route
          path="/campaigns"
          element={
            <Lazy>
              <CampaignsPage />
            </Lazy>
          }
        />

        <Route
          path="/campaigns/:slug"
          element={
            <Lazy>
              <CampaignDetailPage />
            </Lazy>
          }
        />

        <Route
          path="/campaigns/:slug/analytics"
          element={
            <Lazy>
              <SponsorAnalyticsPage />
            </Lazy>
          }
        />
      </Route>

      {/* AUTH */}

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <Lazy>
              <LoginPage />
            </Lazy>
          }
        />
      </Route>

      {/* EMPTY */}

      <Route element={<EmptyLayout />}>
        <Route
          path="/dev/missions"
          element={
            <Lazy>
              <DeveloperMissionSandbox />
            </Lazy>
          }
        />
      </Route>

      {/* ADMIN */}

      <Route
        path="/admin/*"
        element={
          <Lazy>
            <AdminRoutes />
          </Lazy>
        }
      />
    </Routes>
  );
}
