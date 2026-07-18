export type ActionEventName =
  | "USER_LOGIN"
  | "USER_REGISTER"
  | "PROFILE_COMPLETED"
  | "PROFILE_UPDATED"
  | "CHECKIN"
  | "LISTEN_TICK"
  | "LISTEN_STARTED"
  | "LISTEN_COMPLETED"
  | "PLAYER_PLAY"
  | "PLAYER_PAUSE"
  | "PLAYER_STOP"
  | "PLAYER_DISCONNECT"
  | "SHARE"
  | "REFERRAL_SUCCESS"
  | "MISSION_JOIN"
  | "MISSION_COMPLETE"
  | "SCHEDULER_TICK"
  | "ACHIEVEMENT_UNLOCK"
  | "MILESTONE_UNLOCK"
  | "REWARD_CLAIM"
  | "REWARD_REDEEM"
  | "LOW_STOCK"
  | "VOUCHER_ASSIGNED"
  | "VOUCHER_REFUND"
  | "SHIPPING_STATUS";

export interface ActionEventPayloads {
  USER_LOGIN: { at: string };
  USER_REGISTER: { at: string };
  PROFILE_COMPLETED: { completed_at: string };
  PROFILE_UPDATED: { at: string };
  CHECKIN: { date: string };
  LISTEN_TICK: { seconds: number };
  LISTEN_STARTED: { station?: string; program?: string; timestamp: string };
  LISTEN_COMPLETED: { minutes: number; program?: string };
  PLAYER_PLAY: Record<string, never>;
  PLAYER_PAUSE: Record<string, never>;
  PLAYER_STOP: Record<string, never>;
  PLAYER_DISCONNECT: Record<string, never>;
  SHARE: { share_type: string; target: string; url: string; timestamp: string };
  REFERRAL_SUCCESS: { referrer_id: string; referred_id: string; timestamp: string };
  MISSION_JOIN: { mission_id: number };
  MISSION_COMPLETE: { mission_id: number; reward_vxp: number };
  SCHEDULER_TICK: Record<string, never>;
  ACHIEVEMENT_UNLOCK: { slug: string; title: string; reward_vxp: number };
  MILESTONE_UNLOCK: { key: string; name: string; reward_vxp: number };
  REWARD_CLAIM: { streak_day: number; reward_vxp: number };
  REWARD_REDEEM: { redeem_id: string; reward_id: number; reward_title: string; required_vxp: number; status: string };
  LOW_STOCK: { reward_id: number; current_stock: number; warning_stock: number };
  VOUCHER_ASSIGNED: { voucher_id: string; voucher_code: string };
  VOUCHER_REFUND: { voucher_id: string; action: string };
  SHIPPING_STATUS: { shipping_id: string; from_status: string; to_status: string; tracking_number: string };
}

export interface ActionEvent<T extends ActionEventName = ActionEventName> {
  name: T;
  userId: string;
  amount?: number;
  payload?: ActionEventPayloads[T];
  idempotencyKey?: string;
}
