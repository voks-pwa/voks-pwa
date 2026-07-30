import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, LogOut, Camera, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/useAuth"
import { logout } from "@/features/auth/authService"
import { useCanonicalUser } from "@/features/profile/hooks/useCanonicalUser"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile"
import { uploadAvatar, deleteOldAvatar, getAvatarSrc, type AvatarUploadResult } from "@/features/profile/services/avatarService"
import { useProfileStore } from "@/stores/profile-store"
import { Skeleton } from "@/components/ui/Skeleton"
import { SocialLinkInput } from "@/components/ui/SocialLinkInput"
import { showToast } from "@/components/ui/showToast"
import { getBadgeName } from "@/features/profile/utils/profileBadge"
import { calculateProfileCompletion } from "@/features/profile/utils/profileCompletion"
import { calculateLevel } from "@/features/xp/utils/level"
import type { UpdateProfileInput } from "@/features/profile/types"

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile, refetch, isLoading: profileLoading } = useProfile()
  const { isLoading: canonicalLoading } = useCanonicalUser()
  const { mutateAsync: saveProfileMutation, isPending: isMutating } = useUpdateProfile()
  const { isSaving, setSaving, setDirty } = useProfileStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [birthday, setBirthday] = useState("")
  const [gender, setGender] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [favoriteProgram, setFavoriteProgram] = useState("")
  const [favoriteMusic, setFavoriteMusic] = useState("")
  const [instagram, setInstagram] = useState("")
  const [tiktok, setTiktok] = useState("")
  const [youtube, setYoutube] = useState("")
  const [facebook, setFacebook] = useState("")
  const [threads, setThreads] = useState("")
  const [website, setWebsite] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const levelData = calculateLevel(profile?.lifetime_vxp ?? 0)
  const currentAvatar = avatarPreview ?? getAvatarSrc(profile?.avatar_url ?? null, user?.user_metadata)
  const completion = profile ? calculateProfileCompletion(profile) : 0

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? "")
    setFullName(profile.full_name ?? "")
    setBio(profile.bio ?? "")
    setPhoneNumber(profile.phone_number ?? "")
    setBirthday(profile.birthday ?? "")
    setGender(profile.gender ?? "")
    setCity(profile.city ?? "")
    setProvince(profile.province ?? "")
    setFavoriteProgram(profile.favorite_program ?? "")
    setFavoriteMusic(profile.favorite_music ?? "")
    setInstagram(profile.instagram ?? "")
    setTiktok(profile.tiktok ?? "")
    setYoutube(profile.youtube ?? "")
    setFacebook(profile.facebook ?? "")
    setThreads(profile.threads ?? "")
    setWebsite(profile.website ?? "")
  }, [profile])

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      showToast({ type: "error", title: "Invalid file", message: "Please select an image" })
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setDirty(true)
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/.test(website)) {
      next.website = "Invalid URL format"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!user?.id || !validate()) return
    setSaving(true)
    try {
      let avatarUrl = profile?.avatar_url ?? null
      let avatarAssetId = profile?.avatar_asset_id ?? null
      if (avatarFile) {
        try {
          await deleteOldAvatar(avatarAssetId, avatarUrl)
          const result: AvatarUploadResult = await uploadAvatar(user.id, avatarFile)
          avatarUrl = result.publicUrl
          avatarAssetId = result.assetId
        } catch (err) {
          console.error("Avatar upload failed, keeping existing:", err)
        }
      }
      const payload: UpdateProfileInput = {
        display_name: displayName, full_name: fullName, bio, phone_number: phoneNumber,
        birthday, gender, city, province, favorite_program: favoriteProgram, favorite_music: favoriteMusic,
        instagram, tiktok, youtube, facebook, threads, website,
        avatar_url: avatarUrl ?? undefined,
        avatar_asset_id: avatarAssetId ?? undefined,
      }
      await saveProfileMutation({ id: user.id, payload })
      await refetch()
      setAvatarFile(null)
      setAvatarPreview(null)
      setDirty(false)
      showToast({ type: "success", title: "Profile Saved" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      showToast({ type: "error", title: "Failed to save profile", message })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    const confirmed = window.confirm("Logout dari akun?")
    if (!confirmed) return
    await logout()
    navigate("/")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">Login Required</h1>
          <p className="mt-3 text-gray-500">Please login to access your profile.</p>
          <button onClick={() => navigate("/login")} className="mt-6 w-full rounded-2xl bg-[#bda752] p-4 font-semibold text-white">Login</button>
        </div>
      </div>
    )
  }

  if (profileLoading || canonicalLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    )
  }

  const saving = isSaving || isMutating

  return (
    <div className="space-y-5 pb-24">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
        <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 shadow">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-8 shadow-sm border border-gray-100">
        <div className="relative">
          <img
            src={currentAvatar}
            alt=""
            className="h-24 w-24 rounded-full border-4 border-white object-cover bg-gray-200 shadow-md"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/200" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#bda752] text-white shadow-md hover:bg-[#a69243] transition-colors"
          >
            <Camera size={14} />
          </button>
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-800">{displayName || "Teman Voks"}</h1>
        <p className="text-sm text-gray-400">{user.email}</p>
        {profile && (
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              {getBadgeName(profile.lifetime_vxp)}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
              Lv.{levelData.level}
            </span>
          </div>
        )}
        {profile && (
          <div className="mt-4 w-full">
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
              <span>Profile</span>
              <span className="text-[#bda752]">{completion}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#bda752] transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Current VXP", value: profile?.current_vxp ?? 0 },
          { label: "Lifetime", value: profile?.lifetime_vxp ?? 0 },
          { label: "Level", value: `Lv.${levelData.level}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 text-center shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{stat.label}</p>
            <p className="mt-1 text-lg font-black text-gray-800">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-400">Information</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardField label="Display Name" value={displayName} onChange={(v) => { setDisplayName(v); setDirty(true) }} />
          <CardField label="Full Name" value={fullName} onChange={(v) => { setFullName(v); setDirty(true) }} />
          <CardField label="Phone" value={phoneNumber} onChange={(v) => { setPhoneNumber(v); setDirty(true) }} type="tel" />
          <CardField label="Birthday" value={birthday} onChange={(v) => { setBirthday(v); setDirty(true) }} type="date" />
          <CardSelect label="Gender" value={gender} onChange={(v) => { setGender(v); setDirty(true) }} />
          <CardField label="City" value={city} onChange={(v) => { setCity(v); setDirty(true) }} />
        </div>
        <div className="mt-4">
          <CardField label="Province" value={province} onChange={(v) => { setProvince(v); setDirty(true) }} />
        </div>
        <div className="mt-4">
          <CardField label="Bio" value={bio} onChange={(v) => { setBio(v); setDirty(true) }} textarea />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardField label="Favorite Program" value={favoriteProgram} onChange={(v) => { setFavoriteProgram(v); setDirty(true) }} />
          <CardField label="Favorite Music" value={favoriteMusic} onChange={(v) => { setFavoriteMusic(v); setDirty(true) }} />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-400">Social Media</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SocialLinkInput label="Instagram" value={instagram} onChange={(v) => { setInstagram(v); setDirty(true) }} placeholder="username" prefix="@" />
          <SocialLinkInput label="TikTok" value={tiktok} onChange={(v) => { setTiktok(v); setDirty(true) }} placeholder="username" prefix="@" />
          <SocialLinkInput label="YouTube" value={youtube} onChange={(v) => { setYoutube(v); setDirty(true) }} placeholder="channel" prefix="youtube.com/@" />
          <SocialLinkInput label="Facebook" value={facebook} onChange={(v) => { setFacebook(v); setDirty(true) }} placeholder="username" />
          <SocialLinkInput label="Threads" value={threads} onChange={(v) => { setThreads(v); setDirty(true) }} placeholder="username" prefix="@" />
          <SocialLinkInput label="Website" value={website} onChange={(v) => { setWebsite(v); setDirty(true) }} placeholder="https://" />
        </div>
        {errors.website && <p className="mt-2 text-xs text-red-500">{errors.website}</p>}
      </div>

      <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[#bda752] hover:bg-[#a69243] disabled:opacity-50 disabled:cursor-not-allowed p-4 font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  )
}

function CardField({
  label, value, onChange, type, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean
}) {
  const common = "w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${common} mt-1 h-24 resize-none`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type || "text"} className={`${common} mt-1`} />
      )}
    </div>
  )
}

function CardSelect({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] text-gray-700">
        <option value="">Select {label}</option>
        <option value="Laki Laki">Laki Laki</option>
        <option value="Perempuan">Perempuan</option>
      </select>
    </div>
  )
}
