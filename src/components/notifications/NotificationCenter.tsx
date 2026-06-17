import { useNavigate } from 'react-router-dom'

import { useNotifications } from '@/hooks/useNotifications'

import {
  NotificationStory,
} from './NotificationStories'

export function NotificationCenter() {
  const navigate =
    useNavigate()

  const { data } =
    useNotifications()

  if (!data?.length) {
    return null
  }

  return (
    <section>

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          pb-2
        "
      >
        {data.map((item) => (
          <NotificationStory
            key={item.id}
            imageId={
              item.acf
                ?.notification_image
            }
            title={
              item.acf
                ?.notification_title ??
              ''
            }
            onClick={() =>
              navigate(
                `/notifications/${item.id}`
              )
            }
          />
        ))}
      </div>

    </section>
  )
}