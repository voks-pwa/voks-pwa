import { Outlet } from "react-router-dom";

import { PersistentAudioPlayer } from "@/components/player/PersistentAudioPlayer";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

export function PublicLayout() {
  return (
    <>
      <PersistentAudioPlayer />

      <main className="min-h-screen bg-[#F8F9FA] pb-28">
        <Outlet />
      </main>

      <BottomNavigation />
    </>
  );
}