import { useQuery } from '@tanstack/react-query'
import { NOW_PLAYING_POLL_INTERVAL_MS } from '@/lib/constants'
import { fetchNowPlaying } from '@/services/azuracast'
import type { AzuraCastNowPlayingResponse } from '@/types/azuracast'

export const nowPlayingQueryKey = ['azuracast', 'now-playing'] as const

export function useNowPlaying() {
  return useQuery<AzuraCastNowPlayingResponse>({
    queryKey: nowPlayingQueryKey,
    queryFn: () => fetchNowPlaying(),
    refetchInterval: NOW_PLAYING_POLL_INTERVAL_MS,
  })
}
