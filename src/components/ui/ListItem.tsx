import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface ListItemProps {
  to: string
  icon: ReactNode
  text: string
  iconBg?: string
  iconColor?: string
}

export function ListItem({ to, icon, text, iconBg = 'bg-gray-50', iconColor = 'text-gray-500' }: ListItemProps) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between bg-white px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors first:rounded-t-2xl last:rounded-b-2xl group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor} shrink-0`}>
          {icon}
        </div>
        <span className="font-bold text-sm text-gray-800">{text}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </Link>
  )
}
