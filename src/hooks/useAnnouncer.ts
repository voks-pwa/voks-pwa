import { useQuery } from '@tanstack/react-query'

import {
  getAnnouncer,
} from '@/services/wordpress-api'

import { useAnnouncers } from './useAnnouncers'

export function useAnnouncer(
  slug?: string
) {
  return useQuery({
    queryKey: ['announcer', slug],
    queryFn: () => getAnnouncer(slug),
    enabled: !!slug,
  })
}

export function useAnnouncerById(
  announcerId?: number
) {
  const { data } = useAnnouncers()

  return data?.find(
    (announcer) =>
      announcer.id === announcerId
  )
}

export function useAnnouncersByIds(
  announcerIds?: number[]
) {
  const { data } = useAnnouncers()

  if (!data || !announcerIds?.length) {
    return []
  }

  return data.filter((announcer) =>
    announcerIds.includes(announcer.id)
  )
}