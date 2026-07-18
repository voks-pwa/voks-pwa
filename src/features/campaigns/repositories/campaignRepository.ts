import { mapCampaign } from "../campaignMapper";
import type { Campaign, WPCampaign } from "../types";

const WP_API_URL =
  import.meta.env.VITE_WP_API_URL ??
  "https://voksradio.com/wp-json/wp/v2";

/**
 * Campaign Repository — WordPress is the single source of truth for
 * campaign content. This layer only fetches and maps; no business logic.
 */
export async function fetchWPCampaigns(): Promise<WPCampaign[]> {
  try {
    const response = await fetch(
      `${WP_API_URL}/campaign?_embed&per_page=100`,
    );

    if (!response.ok) {
      console.error("[CAMPAIGN] fetch failed", response.status);
      return [];
    }

    return (await response.json()) as WPCampaign[];
  } catch (error) {
    console.error("[CAMPAIGN] fetch error", error);
    return [];
  }
}

export async function fetchWPCampaignBySlug(
  slug: string,
): Promise<WPCampaign | null> {
  try {
    const response = await fetch(
      `${WP_API_URL}/campaign?_embed&slug=${encodeURIComponent(slug)}`,
    );

    if (!response.ok) {
      console.error("[CAMPAIGN] detail fetch failed", response.status);
      return null;
    }

    const data = (await response.json()) as WPCampaign[];
    return data[0] ?? null;
  } catch (error) {
    console.error("[CAMPAIGN] detail fetch error", error);
    return null;
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  const wp = await fetchWPCampaigns();
  return wp.map(mapCampaign);
}

export async function getCampaignBySlug(
  slug: string,
): Promise<Campaign | null> {
  const wp = await fetchWPCampaignBySlug(slug);
  if (!wp) return null;
  return mapCampaign(wp);
}
