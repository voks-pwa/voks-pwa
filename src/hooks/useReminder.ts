import { useState } from 'react'

import {
saveReminder,
removeReminder,
hasReminder,
} from '@/features/reminders/ReminderStorage'

export function useReminder(
slug?: string,
title?: string,
day?: string,
startTime?: string
) {
const [active, setActive] =
useState(
slug
? hasReminder(slug)
: false
)

async function toggleReminder() {
if (
!slug ||
!title ||
!day ||
!startTime
) {
return
}

if (
  Notification.permission !==
  'granted'
) {
  await Notification.requestPermission()
}

if (active) {
  removeReminder(slug)
  setActive(false)
  return
}

saveReminder({
  slug,
  title,
  day,
  startTime,
})

setActive(true)

}

return {
active,
toggleReminder,
}
}
