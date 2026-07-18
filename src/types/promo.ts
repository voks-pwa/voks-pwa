export interface WordPressPromo {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  acf: {
    promo_link_type?: "internal" | "external" | "mission";
    promo_internal_link?: string;
    promo_external_link?: string;
    promo_featured?: boolean;
    promo_terms?: string;
    promo_badge?: string;
    promo_button_text?: string;
    open_mode?: string;
    deep_link?: {
      url?: string;
      target?: string;
    };
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          medium_large?: {
            source_url: string;
          };
          full?: {
            source_url: string;
          };
        };
      };
    }>;
  };
}
