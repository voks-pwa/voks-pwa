import { useQuery } from '@tanstack/react-query'

async function getOwncastStatus() {
  const response = await fetch(
    'https://live.voksradio.com/api/status'
  )

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