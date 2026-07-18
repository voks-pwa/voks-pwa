import { shareContent } from "@/utils/share";
import { track } from "@/core/action-engine";
import type { MissionConfig } from "../types/mission";

const SHARE_TITLE = "VOKS NEXT";
const SHARE_TEXT = "Yuk dengerin radio digital Bandung di VOKS NEXT!";
const SHARE_URL = "https://app.voksradio.com";

export async function processShareMission(userId: string, mission: MissionConfig) {
  const result = await shareContent({
    title: SHARE_TITLE,
    text: SHARE_TEXT,
    url: SHARE_URL,
  });

  if (!result.success) {
    return { shared: false, message: "Share cancelled" };
  }

  track("SHARE", userId, {
    share_type: "mission",
    target: mission.title,
    url: SHARE_URL,
    timestamp: new Date().toISOString(),
  });

  return {
    shared: true,
    method: result.method,
    message: result.method === "copy" ? "Link berhasil disalin" : "Mission shared",
  };
}
