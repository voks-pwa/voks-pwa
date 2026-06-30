import { useNavigate } from 'react-router-dom'

import { useNotifications } from '@/hooks/useNotifications'

import {
  NotificationStory,
} from './NotificationStories'

function getPriorityColor(
  priority?: string
) {
  switch (priority) {
    case 'Critical':
      return 'bg-red-50 border-red-200'

    case 'Important':
      return 'bg-amber-50 border-amber-200'

    default:
      return 'bg-white'
  }
}

export function NotificationCenter() {
  const navigate =
    useNavigate()

  const { data } =
    useNotifications()

  if (!data?.length) {
    return null
  }

  const featured =
    data.find(
      (item) =>
        item.acf
          ?.notification_priority ===
        'Critical'
    )

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

      </div>

      {/* STORIES */}

      <div className="mb-5 flex gap-4 overflow-x-auto pb-2">

        {data
          .filter(
            (item) =>
              item.acf
                ?.show_as_story
          )
          .map((item) => (
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

      {/* FEATURED */}

      {featured && (
        <button
          onClick={() =>
            navigate(
              `/notifications/${featured.id}`
            )
          }
          className="
            mb-5
            w-full
            rounded-3xl
            border
            border-red-200
            bg-red-50
            p-5
            text-left
          "
        >
          <p className="mb-2 text-xs font-bold uppercase text-red-600">
            🚨 Critical Update
          </p>

          <h3 className="text-lg font-bold">
            {
              featured.acf
                ?.notification_title
            }
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            {
              featured.acf
                ?.notification_message
            }
          </p>

        </button>
      )}

      {/* LIST */}

      <div className="space-y-3">

        {data.slice(0, 5).map(
          (item) => (
            <button
              key={item.id}
              onClick={() =>
                navigate(
                  `/notifications/${item.id}`
                )
              }
              className={`
                w-full
                rounded-2xl
                border
                p-4
                text-left
                ${getPriorityColor(
                  item.acf
                    ?.notification_priority
                )}
              `}
            >
              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#bda752]" />

                <span className="text-xs font-semibold text-gray-500">
                  {
                    item.acf
                      ?.notification_priority
                  }
                </span>

              </div>

              <h3 className="mt-2 font-semibold">
                {
                  item.acf
                    ?.notification_title
                }
              </h3>

            </button>
          )
        )}

      </div>

    </section>
  )
}