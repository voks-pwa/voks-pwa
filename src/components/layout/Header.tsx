import { Link } from 'react-router-dom'
import {
  Bell,
  Search,
} from 'lucide-react'

import { InstallAppButton } from '@/components/pwa/InstallAppButton'

import { useNotifications } from '@/hooks/useNotifications'

export function Header() {
  const { data } =
    useNotifications()

  const notifications =
    data?.filter(
      (item) =>
        item.acf?.featured === true
    ) ?? []
    

  return (
    <header className="mb-8">

      {/* TOP BAR */}

      <div className="mb-5 flex items-center justify-between">

        <div>
          <div>
  <p
    className="
      text-xs
      font-semibold
      uppercase
      tracking-widest
      text-[#bda752]
    "
  >
    Welcome Back
  </p>

  <h1
    className="
      mt-1
      text-2xl
      font-bold
    "
  >
    Feel Good Radio
  </h1>

  <p
    className="
      text-sm
      text-gray-500
    "
  >
    Listen. Watch. Discover.
  </p>
</div>
        </div>

        <div className="flex items-center gap-3">

          {/* SEARCH */}

          <Link
            to="/search"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              shadow
            "
          >
            <Search size={20} />
          </Link>

          {/* NOTIFICATION */}

          <Link
            to="/notifications"
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              shadow
            "
          >
            <Bell size={20} />

            {notifications.length > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
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
                {notifications.length}
              </span>
            )}
          </Link>

        </div>

      </div>

      {/* INSTALL BUTTON */}

      <div className="flex justify-center">
        <InstallAppButton />
      </div>

    </header>
  )
}