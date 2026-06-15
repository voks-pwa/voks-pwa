import { useQuery } from '@tanstack/react-query'

import { getAnnouncer } from '@/services/wordpress-api'

export function useAnnouncer(slug?: string) {
  return useQuery({
    queryKey: ['announcer', slug],
    queryFn: () => getAnnouncer(slug),
    enabled: !!slug,
  })
}