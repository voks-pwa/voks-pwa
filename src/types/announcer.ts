export interface WordPressAnnouncer {
  id: number
  slug: string

  title: {
    rendered: string
  }

  featured_media: number

  acf: {
    link_instagram?: string
    link_tiktok?: string
    link_twitter?: string
    short_description?: string
    shortcode_gallery?: string
  }
}