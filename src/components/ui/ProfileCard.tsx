import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface ProfileCardProps {
  avatarUrl?: string | null
  displayName?: string | null
  badgeName?: string | null
}

export function ProfileCard({ avatarUrl, displayName, badgeName }: ProfileCardProps) {
  return (
    <Link
      to="/profile"
      className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-4">
        <OptimizedImage
          src={avatarUrl || '/default-avatar.png'}
          alt="Profile"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
        />
        <div>
          <p className="font-bold text-gray-800">{displayName}</p>
          <p className="text-xs text-gray-400 font-medium">{badgeName || 'Member'}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </Link>
  )
}
