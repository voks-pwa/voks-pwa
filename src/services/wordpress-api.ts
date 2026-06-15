import type { WordPressAnnouncer } from '@/types/announcer'

const WP_API_URL = 'https://voksradio.com/wp-json/wp/v2'

export async function getAnnouncers(): Promise<WordPressAnnouncer[]> {
  const response = await fetch(
    `${WP_API_URL}/announcer?per_page=100`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch announcers')
  }

  return response.json()
}