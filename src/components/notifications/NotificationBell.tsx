import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  getReadNotifications,
} from '@/utils/notificationStorage'

import { useNotifications } from '@/hooks/useNotifications'

export function NotificationBell() {
  const { data } =
    useNotifications()

  const read =
    getReadNotifications()

  const unreadCount =
    data?.filter(
      (item) =>
        !read.includes(item.id)
    ).length ?? 0

  return (
    <Link
      to="/notifications"
      className="relative"
    >
      <Bell size={22} />

      {unreadCount > 0 && (
        <div
          className="
            absolute
            -right-2
            -top-2
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-red-500
            text-[10px]
            font-bold
            text-white
          "
        >
          {unreadCount}
        </div>
      )}
    </Link>
  )
}