import { useQuery } from '@tanstack/react-query'

import {
  getVoksPlus,
} from '@/services/wordpress-api'

export function useVoksPlus() {
  return useQuery({
    queryKey: ['voks-plus'],
    queryFn: getVoksPlus,
  })
}