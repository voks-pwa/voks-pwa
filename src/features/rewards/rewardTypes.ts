export interface WPReward {
  id: number;

  slug: string;

  title: {
    rendered: string;
  };

  image_url?: string;

  acf: {
    reward_name?: string;

    reward_subtitle?: string;

    reward_cost: number;

    reward_stock: number;

    reward_image?: number;

    reward_active: boolean;

    reward_description?: string;

    reward_code_type?: string;

    reward_delivery_type?: string;

    reward_gallery?: number[];

    reward_featured?: boolean;

    reward_expired_at?: string;

    reward_max_per_user?: number;

    reward_status?: string;

    reward_badge?: string;

    reward_delivery_notes?: string;

    reward_terms?: string;

    Reward_Color?: string;

    reward_priority?: number;

    reward_bonus_vxp?: number;
  };
}

export interface Reward {
  id: number;

  slug: string;

  title: string;

  subtitle: string;

  description: string;

  cost: number;

  stock: number;

  image?: string;

  active: boolean;

  featured: boolean;

  status: string;

  badge?: string;

  color: string;

  deliveryType: string;

  deliveryNotes?: string;

  terms?: string;

  codeType: string;

  expiredAt?: string;

  priority: number;

  maxPerUser: number;

  bonusVxp: number;
}