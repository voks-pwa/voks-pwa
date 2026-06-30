export interface ReminderItem {
  slug: string
  title: string
  day: string
  startTime: string
}

const STORAGE_KEY =
  'voks-reminders'

export function getReminders(): ReminderItem[] {
  return JSON.parse(
    localStorage.getItem(
      STORAGE_KEY
    ) || '[]'
  )
}

export function saveReminder(
  reminder: ReminderItem
) {
  const current =
    getReminders()

  const exists =
    current.find(
      (item) =>
        item.slug === reminder.slug
    )

  if (exists) return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      ...current,
      reminder,
    ])
  )
}

export function removeReminder(
  slug: string
) {
  const current =
    getReminders()

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      current.filter(
        (item) =>
          item.slug !== slug
      )
    )
  )
}

export function hasReminder(
  slug: string
) {
  return getReminders().some(
    (item) =>
      item.slug === slug
  )
}