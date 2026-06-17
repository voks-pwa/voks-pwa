import {
  Home,
  Radio,
  Podcast,
  Menu,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

export function BottomNavigation() {
  const items = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      label: 'Live',
      icon: Radio,
      path: '/live',
    },
    {
      label: 'Voks+',
      icon: Podcast,
      path: '/plus',
    },
    {
      label: 'More',
      icon: Menu,
      path: '/more',
    },
  ]

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        bg-white
        shadow-lg
      "
    >
      <div className="mx-auto flex max-w-lg justify-around py-3">

        {items.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                flex-col
                items-center
                gap-1
                text-xs
                ${
                  isActive
                    ? 'text-[#5B5B3F]'
                    : 'text-gray-400'
                }
              `
              }
            >
              <Icon size={20} />

              <span>
                {item.label}
              </span>
            </NavLink>
          )
        })}

      </div>
    </nav>
  )
}