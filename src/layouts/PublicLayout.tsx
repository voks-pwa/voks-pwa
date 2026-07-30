import { Outlet } from "react-router-dom";

import { PersistentAudioPlayer } from "@/components/player/PersistentAudioPlayer";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { RewardPopup } from "@/features/missions/components/RewardPopup";

export function PublicLayout() {
  return (
    <>
      <PersistentAudioPlayer />

      <main className="min-h-screen bg-[#F8F9FA] pb-28">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>

      <BottomNavigation />

      <RewardPopup />
    </>
  );
}