import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { showToast } from "@/components/ui/showToast"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { useAuth } from "@/features/auth/useAuth"
import { ProfileCard } from "@/components/ui/ProfileCard"
import { useIsFeatureEnabled } from "@/features/flags"
import { track } from "@/core/action-engine"
import { getStreak } from "@/features/retention/repositories/streakRepository"
import { LoginCta } from "./components/LoginCta"
import { MembershipSection } from "./components/MembershipSection"
import { ExploreSection } from "./components/ExploreSection"
import { ConnectSection } from "./components/ConnectSection"
import { SupportSection } from "./components/SupportSection"
import { AboutCard } from "./components/AboutCard"

function CheckinButton() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split("T")[0]
  const storageKey = `voks-checkin-${today}`
  const [done, setDone] = useState(() => localStorage.getItem(storageKey) === "true")
  const [streakCount, setStreakCount] = useState(0)

  useEffect(() => {
    if (!user) return
    getStreak(user.id, "daily").then((s) => {
      if (s) setStreakCount(s.current_streak)
    }).catch(() => {})
  }, [user])

  if (!user) return null

  const handleCheckin = () => {
    track("CHECKIN", user.id, { date: today })
    localStorage.setItem(storageKey, "true")
    setDone(true)
    setStreakCount((c) => c + 1)
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] })
    showToast({ type: "success", title: "Checkin berhasil!", message: "VXP ditambahkan ke akun kamu" })
  }

  return (
    <div className="mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <button
        onClick={handleCheckin}
        disabled={done}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-gray-50 disabled:cursor-default disabled:opacity-70 disabled:hover:bg-white"
      >
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm ${done ? "bg-green-100 text-green-600" : "bg-linear-to-br from-amber-400 to-amber-600 text-white"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            {done ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
              </>
            )}
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-bold ${done ? "text-green-700" : "text-gray-800"}`}>
            {done ? "Sudah Checkin Hari Ini" : "Checkin Harian"}
          </p>
          <p className="text-xs text-gray-400">
            {streakCount > 0 ? `Streak ${streakCount} hari` : done ? "Kembali besok untuk checkin lagi" : "Dapatkan VXP setiap hari"}
          </p>
        </div>
        {!done && (
          <span className="shrink-0 rounded-xl bg-[#bda752] px-4 py-2 text-xs font-bold text-white">
            Checkin
          </span>
        )}
      </button>
    </div>
  )
}

const BADGE_THRESHOLDS = [
  { name: "Pendatang Baru", xp: 0 },
  { name: "Teman Voks", xp: 100 },
  { name: "Voks Aktif", xp: 500 },
  { name: "Penikmat Frekuensi", xp: 750 },
  { name: "Voks Addict", xp: 1000 },
  { name: "Penguasa Gelombang", xp: 4000 },
  { name: "Voks Maniac", xp: 10000 },
  { name: "Voks Royalty", xp: 25000 },
  { name: "Voks Legend", xp: 50000 },
]

function BadgeProgress({ lifetimeVxp }: { lifetimeVxp: number }) {
  let currentBadge = BADGE_THRESHOLDS[0]
  let nextBadge: (typeof BADGE_THRESHOLDS)[number] | null = null

  for (let i = BADGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (lifetimeVxp >= BADGE_THRESHOLDS[i].xp) {
      currentBadge = BADGE_THRESHOLDS[i]
      nextBadge = BADGE_THRESHOLDS[i + 1] ?? null
      break
    }
  }

  if (!nextBadge) return null

  const currentXp = lifetimeVxp - currentBadge.xp
  const neededXp = nextBadge.xp - currentBadge.xp
  const pct = Math.min(Math.round((currentXp / neededXp) * 100), 100)

  return (
    <div className="border-t border-gray-100 px-4 pb-4 pt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-500">{currentBadge.name}</span>
        <span className="font-medium text-[#bda752]">{nextBadge.name}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full bg-[#bda752] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-gray-400">
        {neededXp - currentXp} VXP lagi menuju {nextBadge.name}
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

      <CheckinButton />

      {user && <ProfileCard avatarUrl={profile?.avatar_url} displayName={profile?.display_name} badgeName={profile?.badge_name} />}

      <MembershipSection profile={profile ?? undefined} missionEnabled={missionEnabled} rewardEnabled={rewardEnabled} />

      <ExploreSection />

      <ConnectSection />

      <SupportSection handleShare={handleShare} />

      <AboutCard />
    </>
  )
}
