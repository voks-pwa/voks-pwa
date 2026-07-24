import { showToast } from "@/components/ui/showToast"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { useAuth } from "@/features/auth/useAuth"
import { ProfileCard } from "@/components/ui/ProfileCard"
import { useIsFeatureEnabled } from "@/features/flags"
import { LoginCta } from "./components/LoginCta"
import { MembershipSection } from "./components/MembershipSection"
import { ExploreSection } from "./components/ExploreSection"
import { ConnectSection } from "./components/ConnectSection"
import { SupportSection } from "./components/SupportSection"
import { AboutCard } from "./components/AboutCard"

export function MorePage() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const missionEnabled = useIsFeatureEnabled("mission")
  const rewardEnabled = useIsFeatureEnabled("reward")

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "VOKS NEXT", text: "Listen. Watch. Discover. Connect.", url: window.location.origin })
        return
      }
      await navigator.clipboard.writeText(window.location.origin)
      showToast({ type: "success", title: "Link copied to clipboard" })
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

      {user && <ProfileCard avatarUrl={profile?.avatar_url} displayName={profile?.display_name} badgeName={profile?.badge_name} />}

      <MembershipSection profile={profile ?? undefined} missionEnabled={missionEnabled} rewardEnabled={rewardEnabled} />

      <ExploreSection />

      <ConnectSection />

      <SupportSection handleShare={handleShare} />

      <AboutCard />
    </>
  )
}
