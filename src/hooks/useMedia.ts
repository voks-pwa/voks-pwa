import { useQuery } from '@tanstack/react-query'
import { getMedia } from '@/services/wordpress-api'

export function useMedia(mediaId?: number) {
  return useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMedia(mediaId!),
    enabled: !!mediaId,
  })
}