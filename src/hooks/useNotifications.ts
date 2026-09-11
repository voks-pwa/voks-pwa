import { useQuery } from '@tanstack/react-query'

import {
  getNotifications,
} from '@/services/wordpress-api'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}