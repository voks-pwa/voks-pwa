import { memo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotifications } from '@/hooks/useNotifications'

import {
  NotificationStory,
} from './NotificationStories'

export const NotificationCenter = memo(function NotificationCenter() {
  const navigate = useNavigate()

  const { data } = useNotifications()

  const stories = data?.filter((item) => item.acf?.show_as_story) ?? []

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
