import { Calendar, Home, Radio, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function BottomNavigation() {
  const location = useLocation()

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

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-xs ${
                active
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}