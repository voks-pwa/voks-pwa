export type CampaignStatus =
  | "upcoming"
  | "running"
  | "ending_soon"
  | "ended"
  | "archived"
  | "hidden"
  | "inactive";

export interface WPCampaign {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  acf?: {
    campaign_start?: string;
    campaign_end?: string;
    campaign_active?: boolean;
    campaign_featured?: boolean;
    campaign_priority?: number;
    campaign_banner?: number | string;
    campaign_thumbnail?: number | string;
    campaign_sponsor?: string;
    campaign_type?: string;
    theme_color?: string;
    deep_link?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          medium_large?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
  };
}

export interface Campaign {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  thumbnail_url: string | null;
  sponsor_name: string | null;
  campaign_type: string | null;
  campaign_start: string | null;
  campaign_end: string | null;
  campaign_active: boolean;
  featured: boolean;
  priority: number;
  theme_color: string | null;
  deep_link: string | null;
  status: CampaignStatus;
}

export interface CampaignListFilter {
  onlyActive?: boolean;
  now?: Date;
}
