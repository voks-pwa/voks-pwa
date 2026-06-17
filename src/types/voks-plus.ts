export interface WordPressVoksPlus {
  id: number

  slug: string

  title: {
    rendered: string
  }

  content: {
    rendered: string
  }

  acf: {
    content_type?: string

    youtube_url?: string

    duration?: string

    guest_name?: string

    thumbnail?: number
  }

  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string

      media_details?: {
        sizes?: {
          medium_large?: {
            source_url: string
          }
        }
      }
    }>
  }
}