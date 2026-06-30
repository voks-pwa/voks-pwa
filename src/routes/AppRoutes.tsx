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
import { MorePage } from "@/pages/MorePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { MissionsPage } from "@/pages/MissionsPage";
import { RewardStorePage } from "@/pages/RewardStorePage";
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

        <Route path="/more" element={<MorePage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/missions" element={<MissionsPage />} />

        <Route path="/reward-store" element={<RewardStorePage />} />

        <Route path="/rewards" element={<RewardStorePage />} />

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