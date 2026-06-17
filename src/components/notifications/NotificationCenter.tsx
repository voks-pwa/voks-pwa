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
    <div className="mb-4 flex items-center justify-between">

  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
      Notifications
    </p>

    <h2 className="text-lg font-bold">
      Latest Updates
    </h2>
  </div>

  <button
    onClick={() =>
      navigate('/notifications')
    }
    className="text-sm font-medium text-primary"
  >
    View All
  </button>

</div>

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