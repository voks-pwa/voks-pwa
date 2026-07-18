import { Routes, Route } from "react-router-dom";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { EmptyLayout } from "@/layouts/EmptyLayout";

import { AdminRoutes } from "./AdminRoutes";

import { HomePage } from "@/pages/HomePage";
import { ProgramsPage } from "@/pages/ProgramsPage";
import { ProgramDetailPage } from "@/pages/ProgramDetailPage";
import { AnnouncersPage } from "@/pages/AnnouncersPage";
import { AnnouncerDetailPage } from "@/pages/AnnouncerDetailPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { LiveStudioPage } from "@/pages/LiveStudioPage";
import { VoksPlusPage } from "@/pages/VoksPlusPage";
import { VoksPlusDetailPage } from "@/pages/VoksPlusDetailPage";
import { SearchPage } from "@/pages/SearchPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { NotificationDetailPage } from "@/pages/NotificationDetailPage";
import { PromoDetailPage } from "@/pages/PromoDetailPage";
import { PromoListPage } from "@/pages/PromoListPage";
import { MorePage } from "@/pages/MorePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { FeatureGuard } from "@/components/ui/FeatureGuard";
import { MissionsPage } from "@/pages/MissionsPage";
import { MissionDetailPage } from "@/pages/MissionDetailPage";
import { RewardStorePage } from "@/pages/RewardStorePage";
import { RewardHistoryPage } from "@/features/rewards/pages/RewardHistoryPage";
import { RewardDetailPage } from "@/features/rewards/pages/RewardDetailPage";
import { LeaderboardPage } from "@/features/leaderboard/pages/LeaderboardPage";
import { CampaignsPage } from "@/pages/CampaignsPage";
import { CampaignDetailPage } from "@/pages/CampaignDetailPage";
import { SponsorAnalyticsPage } from "@/pages/SponsorAnalyticsPage";
import DeveloperMissionSandbox from "@/pages/DeveloperMissionSandbox";

/* semua page */

export function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route element={<PublicLayout />}>

        <Route path="/" element={<HomePage />} />

        <Route path="/programs" element={<ProgramsPage />} />

        <Route path="/programs/:slug" element={<ProgramDetailPage />} />

        <Route path="/announcers" element={<AnnouncersPage />} />

        <Route path="/announcers/:slug" element={<AnnouncerDetailPage />} />

        <Route path="/schedule" element={<SchedulePage />} />

        <Route path="/live" element={<LiveStudioPage />} />

        <Route path="/plus" element={<VoksPlusPage />} />

        <Route path="/plus/:slug" element={<VoksPlusDetailPage />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/notifications" element={<NotificationsPage />} />

        <Route
          path="/notifications/:id"
          element={<NotificationDetailPage />}
        />

        <Route path="/promo" element={<PromoListPage />} />

        <Route
          path="/promo/:slug"
          element={<PromoDetailPage />}
        />

        <Route path="/more" element={<MorePage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/missions"
          element={
            <FeatureGuard feature="mission" title="Mission Center">
              <MissionsPage />
            </FeatureGuard>
          }
        />

        <Route
          path="/missions/:id"
          element={
            <FeatureGuard feature="mission" title="Mission Center">
              <MissionDetailPage />
            </FeatureGuard>
          }
        />

        <Route
          path="/reward-store"
          element={
            <FeatureGuard feature="reward" title="Reward Store">
              <RewardStorePage />
            </FeatureGuard>
          }
        />

        <Route
          path="/reward-store/:slug"
          element={
            <FeatureGuard feature="reward" title="Reward Store">
              <RewardDetailPage />
            </FeatureGuard>
          }
        />

        <Route
          path="/reward-history"
          element={
            <FeatureGuard feature="reward" title="Reward History">
              <RewardHistoryPage />
            </FeatureGuard>
          }
        />

        <Route
          path="/leaderboard"
          element={<LeaderboardPage />}
        />

        <Route
          path="/campaigns"
          element={<CampaignsPage />}
        />

        <Route
          path="/campaigns/:slug"
          element={<CampaignDetailPage />}
        />

        <Route
          path="/campaigns/:slug/analytics"
          element={<SponsorAnalyticsPage />}
        />

      </Route>

      {/* AUTH */}

      <Route element={<AuthLayout />}>

        <Route
          path="/login"
          element={<LoginPage />}
        />

      </Route>

      {/* EMPTY */}

      <Route element={<EmptyLayout />}>

        <Route
          path="/dev/missions"
          element={<DeveloperMissionSandbox />}
        />

      </Route>

      {/* ADMIN */}

      <Route
        path="/admin/*"
        element={<AdminRoutes />}
      />

    </Routes>
  );
}