export type RedeemStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "REFUNDED"
  | "CANCELLED";

export interface RedeemRecord {
  id: string;
  user_id: string;
  reward_id: number;
  reward_title: string;
  required_vxp: number;
  status: RedeemStatus;
  approval_required: boolean;
  approved_by: string | null;
  approved_at: string | null;
  tracking_number: string | null;
  shipping_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
}

export interface RedeemInput {
  userId: string;
  rewardId: number;
  rewardTitle: string;
  requiredVxp: number;
  approvalRequired: boolean;
  voucherReward?: boolean;
  needShipping?: boolean;
  shippingAddress?: ShippingAddress;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  redeemId?: string;
}
