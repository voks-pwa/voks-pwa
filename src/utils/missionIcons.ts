import {
  Radio,
  Headphones,
  Share2,
  UserPlus,
  Trophy,
} from 'lucide-react'

export function getMissionIcon(icon?: string) {
  switch (icon) {
    case 'radio':
      return Radio

    case 'headphones':
      return Headphones

    case 'share':
      return Share2

    case 'referral':
      return UserPlus

    default:
      return Trophy
  }
}