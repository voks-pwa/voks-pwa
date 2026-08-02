import { useQuery } from '@tanstack/react-query'
import { getPrograms } from '@/services/wordpress-api'

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms,
    staleTime: 5 * 60 * 1000,

    select: (data) =>
      data.sort(
        (a, b) =>
          (a.acf?.program_order ?? 999) -
          (b.acf?.program_order ?? 999)
      ),
  })
}