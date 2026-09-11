export interface WordPressNowPlaying {
  success: boolean
  station: string
  artist: string
  title: string
  album: string
  artwork: string | null
  source: string
  duration: number
  elapsed: number
  is_live: boolean
  streamer: string
  updated_at: number
}