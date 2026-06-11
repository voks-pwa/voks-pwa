import type { AzuraCastNowPlayingResponse } from '@/types/azuracast'

export interface DisplayTrack {
  title: string
  artist: string
  artworkUrl: string | null
  isLive: boolean
}

export function getDisplayTrack(
  data: AzuraCastNowPlayingResponse | undefined,
): DisplayTrack {
  if (!data) {
    return {
      title: 'Loading...',
      artist: 'Voks Radio',
      artworkUrl: null,
      isLive: false,
    }
  }

  const { live, now_playing: nowPlaying } = data

  if (live.is_live) {
    return {
      title: live.streamer_name || nowPlaying.song.title || 'Live Broadcast',
      artist: 'Live on Air',
      artworkUrl: live.art ?? nowPlaying.song.art ?? null,
      isLive: true,
    }
  }

  return {
    title: nowPlaying.song.title || 'Unknown Title',
    artist: nowPlaying.song.artist || 'Unknown Artist',
    artworkUrl: nowPlaying.song.art || null,
    isLive: false,
  }
}
