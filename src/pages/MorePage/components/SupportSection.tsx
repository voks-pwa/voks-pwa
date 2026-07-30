import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, Share2, Star, Copy, ChevronRight } from "lucide-react"
import { useAuth } from "@/features/auth/useAuth"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { showToast } from "@/components/ui/showToast"
import { SectionHeader } from "./SectionHeader"

interface Props {
  handleShare: () => void
}

function ReferralLink() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const [copied, setCopied] = useState(false)

  if (!user || !profile?.referral_code) return null

  const link = `${window.location.origin}/ref/${profile.referral_code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    showToast({ type: "success", title: "Link referral disalin!" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-100 to-sky-200 text-sky-600 shadow-sm transition group-hover:shadow-md">
          <Copy size={20} />
        </div>
        <div>
          <p className="font-bold text-gray-800">Referral Link</p>
          <p className="text-xs text-gray-400">{copied ? "Tersalin!" : profile.referral_code}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300 transition group-hover:text-gray-500" />
    </button>
  )
}

export function SupportSection({ handleShare }: Props) {
  return (
    <div className="mb-6">
      <SectionHeader icon={Bell} label="Support" />
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <ReferralLink />

        <Link to="/notifications" className="group flex items-center justify-between px-5 py-4 transition hover:bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-100 to-amber-200 text-amber-600 shadow-sm transition group-hover:shadow-md">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-400">Stay updated</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 transition group-hover:text-gray-500" />
        </Link>

        <button
          onClick={handleShare}
          className="group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-sm transition group-hover:shadow-md">
              <Share2 size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800">Share App</p>
              <p className="text-xs text-gray-400">Invite friends</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 transition group-hover:text-gray-500" />
        </button>

        <button className="group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-100 to-purple-200 text-purple-600 shadow-sm transition group-hover:shadow-md">
              <Star size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800">Rate App</p>
              <p className="text-xs text-gray-400">Leave a review</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 transition group-hover:text-gray-500" />
        </button>
      </div>
    </div>
  )
}
