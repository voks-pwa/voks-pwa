import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { showToast } from "@/components/ui/showToast"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { useAuth } from "@/features/auth/useAuth"
import { ProfileCard } from "@/components/ui/ProfileCard"
import { useIsFeatureEnabled } from "@/features/flags"
import { track } from "@/core/action-engine"
import { getStreak } from "@/features/retention/repositories/streakRepository"
import { getXpBadgeDefinitions } from "@/features/retention/repositories/badgeRepository"
import type { XpBadgeDefinition } from "@/features/retention/repositories/badgeRepository"
import { LoginCta } from "./components/LoginCta"
import { MembershipSection } from "./components/MembershipSection"
import { ExploreSection } from "./components/ExploreSection"
import { ConnectSection } from "./components/ConnectSection"
import { SupportSection } from "./components/SupportSection"
import { AboutCard } from "./components/AboutCard"

function CheckinStreakCard() {
  const { user } = useAuth()
  const [streakCount, setStreakCount] = useState(0)

  useEffect(() => {
    if (!user) return
    getStreak(user.id, "daily").then((s) => {
      if (s) setStreakCount(s.current_streak)
    }).catch(() => {})
  }, [user])

  if (!user) return null

  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-800">Checkin Harian</p>
          <p className="text-xs text-gray-400">
            {streakCount > 0 ? `Streak ${streakCount} hari — checkin lewat Daily Missions` : "Checkin lewat Daily Missions"}
          </p>
        </div>
        {streakCount > 0 && (
          <span className="shrink-0 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
            {streakCount} hari
          </span>
        )}
      </div>
    </div>
  )
}

function BadgeProgress({ lifetimeVxp }: { lifetimeVxp: number }) {
  const { data: badges = [] } = useQuery({
    queryKey: ["xp-badges"],
    queryFn: getXpBadgeDefinitions,
  })

  const vxpBadges = badges.filter((b: XpBadgeDefinition) => b.min_role == null)
  if (!vxpBadges.length) return null

  let currentBadge = vxpBadges[0]
  let nextBadge: XpBadgeDefinition | null = null

  for (let i = vxpBadges.length - 1; i >= 0; i--) {
    if (lifetimeVxp >= vxpBadges[i].min_lifetime_vxp) {
      currentBadge = vxpBadges[i]
      nextBadge = vxpBadges[i + 1] ?? null
      break
    }
  }

  if (!nextBadge) return null

  const currentXp = lifetimeVxp - currentBadge.min_lifetime_vxp
  const neededXp = nextBadge.min_lifetime_vxp - currentBadge.min_lifetime_vxp
  const pct = Math.min(Math.round((currentXp / neededXp) * 100), 100)

  return (
    <div className="border-t border-gray-100 px-4 pb-4 pt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-500">{currentBadge.title}</span>
        <span className="font-medium text-[#bda752]">{nextBadge.title}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full bg-[#bda752] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-gray-400">
        {neededXp - currentXp} VXP lagi menuju {nextBadge.title}
      </p>
    </div>
  )
}

export function MorePage() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const missionEnabled = useIsFeatureEnabled("mission")
  const rewardEnabled = useIsFeatureEnabled("reward")

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "VOKS NEXT", text: "Listen. Watch. Discover. Connect.", url: window.location.origin })
      } else {
        await navigator.clipboard.writeText(window.location.origin)
        showToast({ type: "success", title: "Link copied to clipboard" })
      }
      if (user) {
        track("SHARE", user.id, {
          share_type: "more_page",
          target: "general",
          url: window.location.origin,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  return (
    <>
      {!user && <LoginCta />}

      <div className="mb-6 overflow-hidden rounded-4xl bg-linear-to-br from-[#4E523C] to-[#3B3E2D] p-6 sm:p-8 text-white shadow-md relative">
        <div className="absolute right-4 bottom-4 top-4 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-white">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">VOKS NEXT</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">The Future of<br />Voks Radio</h1>
        <p className="mt-2 text-sm text-white/70">Listen. Watch. Discover. Connect.</p>
        <div className="mt-8 flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-white/40 font-medium">Welcome Back</p>
            <p className="text-lg font-bold mt-0.5 tracking-wide">{user ? profile?.display_name ?? "Teman Voks" : "Guest"}</p>
            {user && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#C1A85A] px-3 py-0.5 text-xs font-semibold text-white">{profile?.badge_name || "Newbie"}</span>
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium">{profile?.current_vxp ?? 0} VXP</span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">Version 1.0.0</div>
        </div>
      </div>

      {user && <CheckinStreakCard />}

      {user && profile && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Saldo VXP</p>
              <p className="mt-1 text-2xl font-black text-gray-800">{profile.current_vxp.toLocaleString()}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Total Perolehan</p>
              <p className="mt-1 text-2xl font-black text-[#bda752]">{profile.lifetime_vxp.toLocaleString()}</p>
            </div>
          </div>
          <BadgeProgress lifetimeVxp={profile.lifetime_vxp} />
        </div>
      )}

      {user && <ProfileCard avatarUrl={profile?.avatar_url} displayName={profile?.display_name} badgeName={profile?.badge_name} />}

      <MembershipSection profile={profile ?? undefined} missionEnabled={missionEnabled} rewardEnabled={rewardEnabled} />

      <ExploreSection />

      <ConnectSection />

      <SupportSection handleShare={handleShare} />

      <AboutCard />
    </>
  )
}
