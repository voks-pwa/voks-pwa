export interface WordPressMedia {
  id: number

  source_url: string

  media_details?: {
    sizes?: {
      full?: {
        source_url: string
      }
    }
  }
}