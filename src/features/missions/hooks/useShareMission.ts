import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getMission } from "../services/missionWP";
import { processShareMission } from "../services/missionShareService";
import { showToast } from "@/components/ui/showToast";

export function useShareMission() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async (missionId: number) => {
    if (!user) {
      showToast({ type: "error", title: "Login required" });
      return;
    }

    setIsSharing(true);

    try {
      const mission = await getMission(missionId);
      if (!mission) {
        showToast({ type: "error", title: "Mission not found" });
        return;
      }

      const result = await processShareMission(user.id, mission);

      if (result.shared) {
        if (result.method === "copy") {
          showToast({ type: "success", title: "Link berhasil disalin" });
        }

        queryClient.invalidateQueries({
          queryKey: ["missions-progress", user.id],
        });
      }
    } catch {
      showToast({ type: "error", title: "Share failed" });
    } finally {
      setIsSharing(false);
    }
  }, [user, queryClient]);

  return { share, isSharing };
}
