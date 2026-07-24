import { useQuery } from '@tanstack/react-query'
import { OWNCAST_STATUS_URL } from '@/lib/constants'

async function getOwncastStatus() {
  const response = await fetch(OWNCAST_STATUS_URL)

  if (!response.ok) {
    throw new Error(
      'Failed to fetch Owncast status'
    )
  }

  return response.json()
}

export function useOwncastStatus() {
  return useQuery({
    queryKey: ['owncast-status'],
    queryFn: getOwncastStatus,
    refetchInterval: 30000,
  })
}