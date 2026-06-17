export interface WordPressNotification {
  id: number

  slug: string

  title: {
    rendered: string
  }

  acf: {
    notification_title?: string

    notification_message?: string

    notification_image?: number

    deep_link?: string

    notification_type?: string

    audience?: string

    schedule_send?: string

    expiry_date?: string

    featured?: boolean

    send_now?: boolean
  }
}