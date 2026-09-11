import { useQuery } from '@tanstack/react-query'
import { SONG_UPDATE_POLL_INTERVAL_MS } from '@/lib/constants'
import { fetchSongUpdate, type SongUpdate } from '@/services/azuracast/song-update'

export const songUpdateQueryKey = ['voks', 'song-update'] as const

export function useSongUpdate() {
  return useQuery<SongUpdate | null>({
    queryKey: songUpdateQueryKey,
    queryFn: () => fetchSongUpdate(),
    refetchInterval: SONG_UPDATE_POLL_INTERVAL_MS,
    retry: false,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't spam when offline or Supabase not configured
    enabled: typeof navigator === 'undefined' ? true : navigator.onLine,
  })
}
