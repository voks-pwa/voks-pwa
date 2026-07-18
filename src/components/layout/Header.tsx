import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

import { InstallAppButton } from '@/components/pwa/InstallAppButton'
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge'

export function Header() {
  return (
    <header className="mb-8">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#bda752]">
            Welcome Back
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            VOKS RADIO
          </h1>
          <p className="text-sm text-gray-500">
            Feel the Music. Feel the Vibes. Feel Good.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Link
            to="/search"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow"
          >
            <Search size={20} />
          </Link>

          <Link
            to="/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow"
          >
            <NotificationBadge size={20} />
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