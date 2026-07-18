export type ShippingStatus =
  | "PENDING"
  | "PACKING"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "RETURNED"
  | "REPLACED"
  | "CANCELLED";

export interface ShippingRecord {
  id: string;
  redeem_id: string;
  user_id: string;
  reward_id: number;
  recipient_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  postal_code: string;
  courier: string;
  service: string;
  tracking_number: string;
  shipping_status: ShippingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingTimelineEntry {
  id: string;
  shipping_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
}

export interface ShippingResult {
  success: boolean;
  error?: string;
  shipping_id?: string;
  from?: string;
  to?: string;
}

export interface ShippingQueueItem {
  id: string;
  redeem_id: string;
  user_id: string;
  reward_id: number;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  courier: string;
  service: string;
  tracking_number: string;
  shipping_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  status_history: ShippingTimelineEntry[];
}

export interface ShippingQueueResult {
  success: boolean;
  error?: string;
  data?: ShippingQueueItem[];
}
