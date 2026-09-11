import type { AzuraCastNowPlayingResponse } from '@/types/azuracast'
import type { SongUpdate } from '@/services/azuracast/song-update'
import type { WordPressNowPlaying } from '@/types/wordpress-now-playing'

export interface DisplayTrack {
  title: string
  artist: string
  artworkUrl: string | null
  isLive: boolean
}

function parseFallbackSongUpdate(fallback: SongUpdate | null | undefined): {
  title: string | null
  artist: string | null
} {
  if (!fallback?.raw) return { title: null, artist: null }
  // raw is like "ISYANA SARASVATI - TETAP DALAM JIWA" or already split
  if (fallback.title && fallback.artist) {
    return { title: fallback.title, artist: fallback.artist }
  }
  const parts = fallback.raw.split(' - ')
  if (parts.length >= 2) {
    return {
      artist: parts[0]?.trim() || null,
      title: parts.slice(1).join(' - ').trim() || null,
    }
  }
  return { title: fallback.raw.trim() || null, artist: null }
}

export function resolveDisplayTrack(
  wpNowPlaying?: WordPressNowPlaying | null,
  data?: AzuraCastNowPlayingResponse,
  fallbackSongUpdate?: SongUpdate | null,
): DisplayTrack {
  if (
    wpNowPlaying &&
    (wpNowPlaying.title?.trim() || wpNowPlaying.artist?.trim())
  ) {
    const title =
      wpNowPlaying.title?.trim() ||
      wpNowPlaying.streamer ||
      'Live Broadcast'
    const artist = wpNowPlaying.artist?.trim() ?? 'Voks Radio'
    return {
      title,
      artist,
      artworkUrl: wpNowPlaying.artwork || null,
      isLive: wpNowPlaying.is_live,
    }
  }

  return getDisplayTrack(data, fallbackSongUpdate)
}

export function getDisplayTrack(
  data: AzuraCastNowPlayingResponse | undefined,
  fallbackSongUpdate?: SongUpdate | null,
): DisplayTrack {
  if (!data) {
    // No AzuraCast data — try fallback before showing Loading...
    if (fallbackSongUpdate?.raw) {
      const parsed = parseFallbackSongUpdate(fallbackSongUpdate)
      if (parsed.title) {
        return {
          title: parsed.title,
          artist: parsed.artist || 'Voks Radio',
          artworkUrl: null,
          isLive: false,
        }
      }
    }
    return {
      title: 'Loading...',
      artist: 'Voks Radio',
      artworkUrl: null,
      isLive: false,
    }
  }

  const { live, now_playing: nowPlaying } = data
  const fallbackParsed = parseFallbackSongUpdate(fallbackSongUpdate)

  // Live mode: prioritize actual song title/artist, use fallback if AzuraCast song empty
  if (live.is_live) {
    const title =
      nowPlaying.song.title?.trim() ||
      fallbackParsed.title ||
      live.streamer_name ||
      'Live Broadcast'
    const artist =
      nowPlaying.song.artist?.trim() ||
      fallbackParsed.artist ||
      'Live on Air'
    return {
      title,
      artist,
      artworkUrl: live.art ?? nowPlaying.song.art ?? null,
      isLive: true,
    }
  }

  const title = nowPlaying.song.title?.trim() || fallbackParsed.title || 'Unknown Title'
  const artist = nowPlaying.song.artist?.trim() || fallbackParsed.artist || 'Unknown Artist'

  return {
    title,
    artist,
    artworkUrl: nowPlaying.song.art || null,
    isLive: false,
  }
}
