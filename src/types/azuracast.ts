export interface AzuraCastListeners {
  total: number
  unique: number
  current: number
}

export interface AzuraCastMount {
  id: number
  name: string
  url: string
  bitrate: number
  format: string
  listeners: AzuraCastListeners
  path: string
  is_default: boolean
}

export interface AzuraCastStation {
  id: number
  name: string
  shortcode: string
  description: string
  frontend: string
  backend: string
  timezone: string
  listen_url: string
  url: string
  public_player_url: string
  playlist_pls_url: string
  playlist_m3u_url: string
  is_public: boolean
  mounts: AzuraCastMount[]
  remotes: unknown[]
  hls_enabled: boolean
  hls_is_default: boolean
  hls_url: string | null
  hls_listeners: number
}

export interface AzuraCastSong {
  id: string
  art: string
  custom_fields: unknown[]
  text: string
  artist: string
  title: string
  album: string
  genre: string
  isrc: string
  lyrics: string
}

export interface AzuraCastNowPlayingTrack {
  sh_id: number
  played_at: number
  duration: number
  playlist: string
  streamer: string
  is_request: boolean
  song: AzuraCastSong
  elapsed: number
  remaining: number
}

export interface AzuraCastPlayingNext {
  cued_at: number
  played_at: number
  duration: number
  playlist: string
  is_request: boolean
  song: AzuraCastSong
}

export interface AzuraCastSongHistoryEntry {
  sh_id: number
  played_at: number
  duration: number
  playlist: string
  streamer: string
  is_request: boolean
  song: AzuraCastSong
}

export interface AzuraCastLive {
  is_live: boolean
  streamer_name: string
  broadcast_start: number | null
  art: string | null
}

export interface AzuraCastNowPlayingResponse {
  station: AzuraCastStation
  listeners: AzuraCastListeners
  live: AzuraCastLive
  now_playing: AzuraCastNowPlayingTrack
  playing_next: AzuraCastPlayingNext | null
  song_history: AzuraCastSongHistoryEntry[]
  is_online: boolean
  cache: string | null
}
