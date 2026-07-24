import { Link } from "react-router-dom"
import { Trophy, Gift, ChevronRight } from "lucide-react"
import { SectionHeader } from "./SectionHeader"
import type { Profile } from "@/features/profile/types"

export function MembershipSection({
  profile, missionEnabled, rewardEnabled,
}: {
  profile: Profile | undefined
  missionEnabled: boolean
  rewardEnabled: boolean
}) {
  return (
    <div className="mb-6">
      <SectionHeader icon={Trophy} label="Membership" />
      <div className="space-y-3">
        <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-[#bda752]/30">
          {missionEnabled ? (
            <Link to="/missions" className="flex items-center gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-sm">
                <Trophy size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800">Mission Center</p>
                <p className="text-xs text-gray-400">Complete missions and earn VXP</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {profile && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {profile.current_vxp ?? 0} VXP
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300 transition group-hover:text-[#bda752] group-hover:translate-x-0.5" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                <Trophy size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-800">Mission Center</p>
                <p className="text-xs font-semibold text-amber-500">Coming Soon</p>
              </div>
            </div>
          )}
        </div>

        <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-[#bda752]/30">
          {rewardEnabled ? (
            <Link to="/reward-store" className="flex items-center gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-400 to-rose-500 text-white shadow-sm">
                <Gift size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800">Reward Store</p>
                <p className="text-xs text-gray-400">Redeem your VXP for rewards</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {profile && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    {profile.current_vxp ?? 0} VXP
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300 transition group-hover:text-[#bda752] group-hover:translate-x-0.5" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <Gift size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-800">Reward Store</p>
                <p className="text-xs font-semibold text-amber-500">Coming Soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
