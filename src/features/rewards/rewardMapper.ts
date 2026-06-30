import type {
  WPReward,
  Reward,
} from "./rewardTypes";

export function mapReward(
  wp: WPReward
): Reward {

  return {

    id: wp.id,

    slug: wp.slug,

    title:
      wp.acf.reward_name ??
      wp.title.rendered,

    subtitle:
      wp.acf.reward_subtitle ?? "",

    description:
      wp.acf.reward_description ?? "",

    cost:
      Number(
        wp.acf.reward_cost ?? 0
      ),

    stock:
      Number(
        wp.acf.reward_stock ?? 0
      ),

    image:
      wp.image_url ?? "",

    active:
      Boolean(
        wp.acf.reward_active
      ),

    featured:
      Boolean(
        wp.acf.reward_featured
      ),

    status:
      wp.acf.reward_status ??
      "Available",

    badge:
      wp.acf.reward_badge,

    color:
      wp.acf.Reward_Color ??
      "Gold",

    deliveryType:
      wp.acf.reward_delivery_type ??
      "digital",

    deliveryNotes:
      wp.acf.reward_delivery_notes,

    terms:
      wp.acf.reward_terms,

    codeType:
      wp.acf.reward_code_type ??
      "coupon",

    expiredAt:
      wp.acf.reward_expired_at,

    priority:
      Number(
        wp.acf.reward_priority ?? 99
      ),

    maxPerUser:
      Number(
        wp.acf.reward_max_per_user ?? 1
      ),

    bonusVxp:
      Number(
        wp.acf.reward_bonus_vxp ?? 0
      ),

  };

}