import {
  getReminders,
} from './ReminderStorage'

function getDayName() {
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][new Date().getDay()]
}

export function startReminderScheduler() {
  setInterval(() => {
    const reminders =
      getReminders()

    const now = new Date()

    reminders.forEach(
      (reminder) => {
        const currentDay =
          getDayName()

        if (
          !reminder.day
            .toLowerCase()
            .includes(
              currentDay.toLowerCase()
            )
        ) {
          return
        }

        const [
          hour,
          minute,
        ] =
          reminder.startTime.split(
            ':'
          )

        const showTime =
          new Date()

        showTime.setHours(
          Number(hour)
        )

        showTime.setMinutes(
          Number(minute)
        )

        showTime.setSeconds(0)

        const diff =
          Math.floor(
            (showTime.getTime() -
              now.getTime()) /
              60000
          )

        if (diff === 15) {
          new Notification(
            '🔴 Program Akan Dimulai',
            {
              body: `${reminder.title} mulai dalam 15 menit`,
              icon: '/icon-192.png',
            }
          )
        }
      }
    )
  }, 60000)
}