import { useQuery } from '@tanstack/react-query'
import { getAnnouncers } from '@/services/wordpress-api'

export function useAnnouncers() {
  return useQuery({
    queryKey: ['announcers'],
    queryFn: getAnnouncers,
  })
}