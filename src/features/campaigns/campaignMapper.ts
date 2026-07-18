import type { Campaign, WPCampaign } from "./types";

function pickBanner(wp: WPCampaign): string | null {
  const acfBanner = wp.acf?.campaign_banner;
  if (typeof acfBanner === "string" && acfBanner.startsWith("http")) return acfBanner;
  const media = wp._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return (
    media.media_details?.sizes?.medium_large?.source_url ??
    media.media_details?.sizes?.full?.source_url ??
    media.source_url ??
    null
  );
}

function pickThumbnail(wp: WPCampaign): string | null {
  const acfThumb = wp.acf?.campaign_thumbnail;
  if (typeof acfThumb === "string" && acfThumb.startsWith("http")) return acfThumb;
  const media = wp._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return media.source_url ?? null;
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export function mapCampaign(wp: WPCampaign): Campaign {
  const acf = wp.acf ?? {};

  return {
    id: wp.id,
    slug: wp.slug,
    title: stripHtml(wp.title?.rendered) || wp.slug,
    description: stripHtml(wp.content?.rendered) || null,
    banner_url: pickBanner(wp),
    thumbnail_url: pickThumbnail(wp),
    sponsor_name: acf.campaign_sponsor ?? null,
    campaign_type: acf.campaign_type ?? null,
    campaign_start: acf.campaign_start ?? null,
    campaign_end: acf.campaign_end ?? null,
    campaign_active: Boolean(acf.campaign_active),
    featured: Boolean(acf.campaign_featured),
    priority: Number(acf.campaign_priority ?? 0),
    theme_color: acf.theme_color ?? null,
    deep_link: acf.deep_link ?? null,
    status: "inactive",
  };
}
