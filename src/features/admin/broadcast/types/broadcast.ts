export type BroadcastType = "broadcast" | "announcement" | "promotion" | "maintenance";

export type BroadcastPriority = "Normal" | "Important" | "Critical";

export type BroadcastAudience = "all" | "premium";

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: BroadcastType;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  deep_link: string | null;
  image_url: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface BroadcastFormData {
  title: string;
  message: string;
  type: BroadcastType;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  deep_link?: string;
  image_url?: string;
  scheduled_at?: string;
}
