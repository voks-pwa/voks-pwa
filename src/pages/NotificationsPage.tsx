import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

import { useNotifications } from '@/hooks/useNotifications'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export function NotificationsPage() {
  const {
    data: notifications,
    isLoading,
  } = useNotifications()

  const [dismissed, setDismissed] =
    useState<number[]>(() => {

      try {

        const stored =
          localStorage.getItem(
            'dismissedNotifications'
          )

        return stored
          ? JSON.parse(stored)
          : []

      } catch {

        return []

      }

    })

  function dismissNotification(
    id: number
  ) {

    const updated = [
      ...dismissed,
      id,
    ]

    setDismissed(updated)

    localStorage.setItem(
      'dismissedNotifications',
      JSON.stringify(updated)
    )

  }

  const visibleNotifications =
    notifications?.filter(
      item =>
        !dismissed.includes(item.id)
    ) ?? []

  if (isLoading) {

    return (
      <div className="p-6">
        Loading notifications...
      </div>
    )

  }

  return (
    <>
      <div className="p-6 pb-24">

        <h1 className="mb-6 text-3xl font-bold">
          Notifications
        </h1>

        {visibleNotifications.length === 0 ? (

          <div
            className="
              rounded-3xl
              bg-white
              p-8
              text-center
              shadow
            "
          >
            <p className="text-gray-500">
              No notifications available
            </p>
          </div>

        ) : (

          <div className="space-y-4">

            {visibleNotifications.map(item => (

              <div
                key={item.id}
                className="
                  relative
                  rounded-3xl
                  bg-white
                  p-5
                  shadow
                "
              >

                <button
                  onClick={() =>
                    dismissNotification(item.id)
                  }
                  className="
                    absolute
                    right-4
                    top-4
                    rounded-full
                    p-1
                    text-gray-400
                    hover:bg-gray-100
                  "
                >
                  <X size={18} />
                </button>

                <Link
                  to={`/notifications/${item.id}`}
                  className="block"
                >

                  <div className="mb-3">

                    <span
                      className="
                        rounded-full
                        bg-red-100
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-red-600
                      "
                    >
                      {item.acf?.notification_type ??
                        'Update'}
                    </span>

                  </div>

                  <h2 className="text-xl font-bold">
                    {item.acf?.notification_title}
                  </h2>

                  <p className="mt-3 text-gray-600">
                    {item.acf?.notification_message}
                  </p>

                </Link>

              </div>

            ))}

          </div>

        )}

      </div>

      <BottomNavigation />
    </>
  )
}