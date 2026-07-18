import { runMission } from "@/features/missions/services/missionRunner";
import type { ActionEvent } from "../types";

const EVENT_ACTION_MAP: Record<string, string> = {
  LISTEN_TICK: "listen_tick",
  LISTEN_STARTED: "listen",
  LISTEN_COMPLETED: "listen",
  PLAYER_PLAY: "player_play",
  PLAYER_PAUSE: "player_pause",
  PLAYER_STOP: "player_stop",
  PLAYER_DISCONNECT: "player_disconnect",
  PROFILE_COMPLETED: "profile",
  CHECKIN: "checkin",
  SHARE: "share",
  REFERRAL_SUCCESS: "referral",
  SCHEDULER_TICK: "scheduler_tick",
};

export function missionConsumer(event: ActionEvent) {
  const action = EVENT_ACTION_MAP[event.name];
  if (!action) return;

  runMission({
    userId: event.userId,
    action,
    amount: event.amount ?? 1,
  });
}
