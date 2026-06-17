import {
  Calendar,
  Home,
  Radio,
  Users,
  Video,
} from 'lucide-react'

import {
  Link,
  useLocation,
} from 'react-router-dom'

import { useOwncastStatus } from '@/hooks/useOwncastStatus'

export function BottomNavigation() {
  const location = useLocation()

  const { data: owncast } =
    useOwncastStatus()

  const items = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
    },
    {
      label: 'Programs',
      path: '/programs',
      icon: Radio,
    },
    {
      label: 'Schedule',
      path: '/schedule',
      icon: Calendar,
    },
    {
      label: 'Live',
      path: '/live',
      icon: Video,
      live: owncast?.online,
    },
    {
      label: 'Announcers',
      path: '/announcers',
      icon: Users,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="mx-auto flex max-w-lg justify-around py-3">

        {items.map((item) => {
          const Icon = item.icon

          const active =
            location.pathname === item.path

          const isLiveTab =
            item.label === 'Live'

          return (
            <Link
              key={item.path}
              to={item.path}
              className="
                relative
                flex
                flex-col
                items-center
                text-xs
              "
            >
              <Icon
                size={20}
                className={
                  active
                    ? 'text-primary'
                    : isLiveTab &&
                      item.live
                    ? 'text-red-600'
                    : 'text-gray-400'
                }
              />

              <span
                className={
                  active
                    ? 'text-primary'
                    : isLiveTab &&
                      item.live
                    ? 'font-semibold text-red-600'
                    : 'text-gray-400'
                }
              >
                {item.label}
              </span>

              {isLiveTab &&
                item.live && (
                  <span
                    className="
                      absolute
                      -top-1
                      right-0
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-red-600
                      animate-pulse
                    "
                  />
                )}
            </Link>
          )
        })}

      </div>
    </nav>
  )
}