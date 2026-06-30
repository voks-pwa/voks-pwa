const READ_KEY =
  'voks-read-notifications'

const DISMISSED_KEY =
  'voks-dismissed-notifications'

export function getReadNotifications() {
  return JSON.parse(
    localStorage.getItem(
      READ_KEY
    ) || '[]'
  ) as number[]
}

export function markNotificationRead(
  id: number
) {
  const current =
    getReadNotifications()

  if (current.includes(id)) {
    return
  }

  localStorage.setItem(
    READ_KEY,
    JSON.stringify([
      ...current,
      id,
    ])
  )
}

export function isNotificationRead(
  id: number
) {
  return getReadNotifications().includes(
    id
  )
}

export function getDismissedNotifications() {
  return JSON.parse(
    localStorage.getItem(
      DISMISSED_KEY
    ) || '[]'
  ) as number[]
}

export function dismissNotification(
  id: number
) {
  const current =
    getDismissedNotifications()

  if (current.includes(id)) {
    return
  }

  localStorage.setItem(
    DISMISSED_KEY,
    JSON.stringify([
      ...current,
      id,
    ])
  )
}

export function isDismissed(
  id: number
) {
  return getDismissedNotifications().includes(
    id
  )
}