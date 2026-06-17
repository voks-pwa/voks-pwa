import type { WordPressAnnouncer } from '@/types/announcer'
import type { WordPressProgram } from '@/types/program'
import type { WordPressMedia } from '@/types/media'
import type { WordPressVoksPlus } from '@/types/voks-plus'
import type {
  WordPressNotification,
} from '@/types/notification'

const WP_API_URL = 'https://voksradio.com/wp-json/wp/v2'

export async function getNotifications(): Promise<
  WordPressNotification[]
> {
  const response = await fetch(
    `${WP_API_URL}/push-notification?_embed&per_page=100`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch notifications'
    )
  }

  return response.json()
}

export async function getAnnouncers(): Promise<
  WordPressAnnouncer[]
> {
  const response = await fetch(
    `${WP_API_URL}/announcer?_embed&per_page=100`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch announcers')
  }

  return response.json()
}

export async function getAnnouncer(
  slug?: string
): Promise<WordPressAnnouncer | null> {
  if (!slug) return null

  const response = await fetch(
    `${WP_API_URL}/announcer?_embed&slug=${slug}`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch announcer'
    )
  }

  const data = await response.json()

  return data[0] ?? null
}

export async function getPrograms(): Promise<WordPressProgram[]> {
  const response = await fetch(
    `${WP_API_URL}/program?_embed&per_page=100`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch programs')
  }

  return response.json()
}

export async function getVoksPlus(): Promise<
  WordPressVoksPlus[]
> {
  const response = await fetch(
    `${WP_API_URL}/voks-plus?_embed&per_page=100`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch Voks Plus content'
    )
  }

  return response.json()
}

export async function getVoksPlusItem(
  slug?: string
): Promise<WordPressVoksPlus | null> {
  if (!slug) return null

  const response = await fetch(
    `${WP_API_URL}/voks-plus?_embed&slug=${slug}`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch Voks Plus item'
    )
  }

  const data = await response.json()

  return data[0] ?? null
}

export async function getMedia(
  mediaId: number
): Promise<WordPressMedia> {
  const response = await fetch(
    `${WP_API_URL}/media/${mediaId}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch media')
  }

  return response.json()
}

