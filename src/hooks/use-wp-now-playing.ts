import { useQuery } from '@tanstack/react-query'

import { NOW_PLAYING_POLL_INTERVAL_MS } from '@/lib/constants'
import { fetchWpNowPlaying } from '@/services/wordpress-now-playing'
import type { WordPressNowPlaying } from '@/types/wordpress-now-playing'

export const wpNowPlayingQueryKey = ['wordpress', 'now-playing'] as const

export function useWpNowPlaying() {
  return useQuery<WordPressNowPlaying | null>({
    queryKey: wpNowPlayingQueryKey,
    queryFn: fetchWpNowPlaying,
    refetchInterval: NOW_PLAYING_POLL_INTERVAL_MS,
    staleTime: 5_000,
  })
}