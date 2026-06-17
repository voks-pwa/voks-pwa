import { useNotifications } from '@/hooks/useNotifications'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export function NotificationsPage() {
  const {
    data: notifications,
    isLoading,
  } = useNotifications()

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

        <div className="space-y-4">

          {notifications?.map((item) => (

            <div
              key={item.id}
              className="
                rounded-3xl
                bg-white
                p-5
                shadow
              "
            >

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
                {
                  item.acf
                    ?.notification_type
                }
              </span>

              <h2 className="mt-3 text-xl font-bold">
                {
                  item.acf
                    ?.notification_title
                }
              </h2>

              <p className="mt-3 text-gray-600">
                {
                  item.acf
                    ?.notification_message
                }
              </p>

            </div>

          ))}

        </div>

      </div>

      <BottomNavigation />
    </>
  )
}