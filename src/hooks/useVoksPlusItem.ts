import { useQuery } from '@tanstack/react-query'

import {
  getVoksPlusItem,
} from '@/services/wordpress-api'

export function useVoksPlusItem(
  slug?: string
) {
  return useQuery({
    queryKey: [
      'voks-plus-item',
      slug,
    ],
    queryFn: () =>
      getVoksPlusItem(slug),

    enabled: !!slug,
  })
}