import { memo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotifications } from '@/hooks/useNotifications'

import {
  NotificationStory,
} from './NotificationStories'

export const NotificationCenter = memo(function NotificationCenter() {
  const navigate = useNavigate()

  const { data } = useNotifications()

  const now = Date.now()

  // Hanya tampilkan story bila (1) ditandai show_as_story, (2) belum lewat expiry_date,
  // dan (3) belum waktunya tampil bila dijadwalkan (schedule_send).
  const stories =
    data
      ?.filter((item) => item.acf?.show_as_story)
      .filter((item) => {
        const acf = item.acf
        if (!acf) return true
        if (acf.expiry_date) {
          const exp = new Date(acf.expiry_date).valueOf()
          if (!Number.isNaN(exp) && exp < now) return false
        }
        if (acf.schedule_send) {
          const sched = new Date(acf.schedule_send).valueOf()
          if (!Number.isNaN(sched) && sched > now) return false
        }
        return true
      }) ?? []

  if (!stories.length) return null

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">
        Latest Updates
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-2">
        {stories.map((item) => (
          <NotificationStory
            key={item.id}
            imageId={item.acf?.notification_image}
            title={item.acf?.notification_title ?? ''}
            onClick={() => navigate(`/notifications/${item.id}`)}
          />
        ))}
      </div>
    </section>
  )
})
