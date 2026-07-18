import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { useProfileStore } from '@/stores/profile-store'
import { calculateProfileCompletion } from '@/features/profile/utils/profileCompletion'
import { ArrowLeft, LogOut, Camera, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUserRank } from '@/lib/getUserRank'
import { calculateLevel } from "@/features/xp/utils/level"
import { showToast } from "@/components/ui/showToast"
import { SocialLinkInput } from "@/components/ui/SocialLinkInput"
import type { UpdateProfileInput } from '@/features/profile/types'
import { getBadgeName } from '@/features/profile/utils/profileBadge'

const AVATAR_MAX_WIDTH = 400
const AVATAR_MAX_HEIGHT = 400
const AVATAR_QUALITY = 0.8

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > AVATAR_MAX_WIDTH || height > AVATAR_MAX_HEIGHT) {
        const ratio = Math.min(AVATAR_MAX_WIDTH / width, AVATAR_MAX_HEIGHT / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/jpeg', AVATAR_QUALITY)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

async function uploadAvatar(userId: string, file: File): Promise<string> {
  const resized = await resizeImage(file)
  const path = `${userId}/avatar.jpg`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, resized, { contentType: 'image/jpeg', upsert: true })
  if (uploadError) {
    if (uploadError.message?.includes('bucket')) {
      const { error: bucketError } = await supabase.storage.createBucket('avatars', { public: true })
      if (bucketError) throw bucketError
      const { error: retryError } = await supabase.storage
        .from('avatars')
        .upload(path, resized, { contentType: 'image/jpeg', upsert: true })
      if (retryError) throw retryError
    } else {
      throw uploadError
    }
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

async function deleteOldAvatar(url: string | null) {
  if (!url) return
  try {
    const parsed = new URL(url)
    const pathMatch = parsed.pathname.match(/\/avatars\/(.+)$/)
    if (pathMatch) {
      await supabase.storage.from('avatars').remove([pathMatch[1]])
    }
  } catch {
    // external URL, skip deletion
  }
}

function getAvatarSrc(profileAvatar: string | null, userMetadata: Record<string, unknown> | undefined) {
  if (profileAvatar) {
    if (/^https?:\/\//i.test(profileAvatar)) return profileAvatar
    const { data } = supabase.storage.from('avatars').getPublicUrl(profileAvatar)
    return data.publicUrl
  }
  const meta = userMetadata as Record<string, string | undefined> | undefined
  return meta?.avatar_url ?? meta?.picture ?? 'https://placehold.co/200'
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile, refetch } = useProfile()
  const { mutateAsync: saveProfileMutation, isPending: isMutating } = useUpdateProfile()

  const { isSaving, setSaving, setDirty } = useProfileStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [favoriteProgram, setFavoriteProgram] = useState('')
  const [favoriteMusic, setFavoriteMusic] = useState('')

  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [youtube, setYoutube] = useState('')
  const [facebook, setFacebook] = useState('')
  const [threads, setThreads] = useState('')
  const [website, setWebsite] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const rank = getUserRank(profile?.lifetime_vxp ?? 0)
  const lifetime = profile?.lifetime_vxp ?? 0
  const levelData = calculateLevel(lifetime)
  const referralLink = `${window.location.origin}/login?ref=${profile?.referral_code ?? ''}`

  const progressPercent =
    rank.max === Infinity ? 100
    : (((profile?.lifetime_vxp ?? 0) - rank.min) / (rank.max - rank.min)) * 100

  const currentAvatar = avatarPreview ?? getAvatarSrc(profile?.avatar_url ?? null, user?.user_metadata)

  useEffect(() => {
    if (!profile) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setDisplayName(profile.display_name ?? '')
    setFullName(profile.full_name ?? '')
    setBio(profile.bio ?? '')
    setPhoneNumber(profile.phone_number ?? '')
    setBirthday(profile.birthday ?? '')
    setGender(profile.gender ?? '')
    setCity(profile.city ?? '')
    setProvince(profile.province ?? '')
    setFavoriteProgram(profile.favorite_program ?? '')
    setFavoriteMusic(profile.favorite_music ?? '')
    setInstagram(profile.instagram ?? '')
    setTiktok(profile.tiktok ?? '')
    setYoutube(profile.youtube ?? '')
    setFacebook(profile.facebook ?? '')
    setThreads(profile.threads ?? '')
    setWebsite(profile.website ?? '')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [profile])

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', title: 'Invalid file', message: 'Please select an image' })
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setDirty(true)
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    const urlPatterns: Record<string, RegExp> = {
      website: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/,
    }
    if (website && !urlPatterns.website.test(website)) {
      next.website = 'Invalid URL format'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!user?.id || !validate()) return
    setSaving(true)

    try {
      let avatarUrl = profile?.avatar_url ?? null
      if (avatarFile) {
        try {
          await deleteOldAvatar(avatarUrl)
          avatarUrl = await uploadAvatar(user.id, avatarFile)
        } catch (err) {
          console.error('Avatar upload failed, keeping existing:', err)
        }
      }

      const payload: UpdateProfileInput = {
        display_name: displayName,
        full_name: fullName,
        bio,
        phone_number: phoneNumber,
        birthday,
        gender,
        city,
        province,
        favorite_program: favoriteProgram,
        favorite_music: favoriteMusic,
        instagram,
        tiktok,
        youtube,
        facebook,
        threads,
        website,
        avatar_url: avatarUrl ?? undefined,
      }

      await saveProfileMutation({ id: user.id, payload })
      await refetch()
      setAvatarFile(null)
      setAvatarPreview(null)
      setDirty(false)
      showToast({ type: 'success', title: 'Profile Saved' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      showToast({ type: 'error', title: 'Failed to save profile', message })
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    const confirmed = window.confirm('Logout dari akun?')
    if (!confirmed) return
    supabase.auth.signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">Login Required</h1>
          <p className="mt-3 text-gray-500">Please login to access your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full rounded-2xl bg-[#bda752] p-4 font-semibold text-white"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  const saving = isSaving || isMutating

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarSelect}
      />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 shadow"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* AVATAR */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={currentAvatar}
            alt="avatar"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/200' }}
            className="h-24 w-24 rounded-full border-4 border-white object-cover bg-gray-200 shadow-md"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#bda752] text-white shadow-md hover:bg-[#a69243] transition-colors"
          >
            <Camera size={14} />
          </button>
        </div>
      </div>

      {/* PROFILE COMPLETION */}
      {profile && (
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100">
          <div className="mb-2 flex justify-between text-xs sm:text-sm font-bold text-gray-700">
            <span>Profile Completion</span>
            <span className="text-[#bda752]">{calculateProfileCompletion(profile)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-[#bda752] transition-all duration-500"
              style={{ width: `${calculateProfileCompletion(profile)}%` }}
            />
          </div>
        </div>
      )}

      {/* MEMBER CARD */}
      <div className="overflow-hidden rounded-4xl bg-linear-to-br from-[#4E523C] to-[#3B3E2D] p-6 text-white shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={currentAvatar}
            alt="avatar"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/200' }}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white/20 object-cover bg-gray-700"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{displayName || 'Teman Voks'}</h1>
            <p className="mt-0.5 text-sm text-white/70">{user.email}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#bda752] p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Listener Rank</p>
          <p className="mt-1 text-sm font-semibold">{rank.title}</p>
        </div>

        <div className="mt-5">
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {rank.max !== Infinity && (
            <div className="mt-2 flex justify-between text-[11px] text-white/80 font-medium">
              <span>Menuju {rank.level === 1 ? 'Teman Voks' : rank.level === 2 ? 'Voks Aktif' : rank.level === 3 ? 'Penikmat Frekuensi' : rank.level === 4 ? 'Voks Addict' : rank.level === 5 ? 'Penguasa Gelombang' : rank.level === 6 ? 'Voks Maniac' : rank.level === 7 ? 'Voks Royalty' : 'Voks Legend'}</span>
              <span>{lifetime.toLocaleString()} / {(rank.max + 1).toLocaleString()} VXP</span>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">Current VXP</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-black">{profile?.current_vxp ?? 0}</h2>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">Lifetime VXP</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-black">{profile?.lifetime_vxp ?? 0}</h2>
          </div>
        </div>

        {profile?.referral_code && (
          <div className="rounded-2xl bg-white/10 border border-white/5 p-4 mt-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Referral Link</p>
            <p className="mt-1.5 break-all text-xs font-medium text-white/90 bg-black/10 p-2.5 rounded-xl border border-black/5 select-all">
              {referralLink}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink)
                showToast({ type: "success", title: "Referral link copied" })
              }}
              className="mt-3 rounded-xl bg-[#bda752] hover:bg-[#a69243] active:scale-98 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
            >
              Copy Link
            </button>
          </div>
        )}
      </div>

      {/* BASIC INFORMATION */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Basic Information</p>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setDirty(true) }}
            placeholder="Display Name"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setDirty(true) }}
            placeholder="Full Name"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Phone Number</label>
          <input
            value={phoneNumber}
            onChange={(e) => { setPhoneNumber(e.target.value); setDirty(true) }}
            placeholder="Phone Number"
            type="tel"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Birthday</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => { setBirthday(e.target.value); setDirty(true) }}
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors text-gray-700"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setDirty(true) }}
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors text-gray-700"
          >
            <option value="">Select gender</option>
            <option value="Laki Laki">Laki Laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">City</label>
          <input
            value={city}
            onChange={(e) => { setCity(e.target.value); setDirty(true) }}
            placeholder="City"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Province</label>
          <input
            value={province}
            onChange={(e) => { setProvince(e.target.value); setDirty(true) }}
            placeholder="Province"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Favorite Program</label>
          <input
            value={favoriteProgram}
            onChange={(e) => { setFavoriteProgram(e.target.value); setDirty(true) }}
            placeholder="Favorite Program"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Favorite Music</label>
          <input
            value={favoriteMusic}
            onChange={(e) => { setFavoriteMusic(e.target.value); setDirty(true) }}
            placeholder="Favorite Music"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Short Bio</label>
          <textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); setDirty(true) }}
            placeholder="Bio"
            className="mt-1 h-28 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors resize-none"
          />
        </div>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Social Media</p>

        <SocialLinkInput
          label="Instagram"
          value={instagram}
          onChange={(v) => { setInstagram(v); setDirty(true) }}
          placeholder="username"
          prefix="@"
        />
        <SocialLinkInput
          label="TikTok"
          value={tiktok}
          onChange={(v) => { setTiktok(v); setDirty(true) }}
          placeholder="username"
          prefix="@"
        />
        <SocialLinkInput
          label="YouTube"
          value={youtube}
          onChange={(v) => { setYoutube(v); setDirty(true) }}
          placeholder="channel name"
          prefix="youtube.com/@"
        />
        <SocialLinkInput
          label="Facebook"
          value={facebook}
          onChange={(v) => { setFacebook(v); setDirty(true) }}
          placeholder="username or URL"
        />
        <SocialLinkInput
          label="Threads"
          value={threads}
          onChange={(v) => { setThreads(v); setDirty(true) }}
          placeholder="username"
          prefix="@"
        />
        <SocialLinkInput
          label="Website"
          value={website}
          onChange={(v) => { setWebsite(v); setDirty(true) }}
          placeholder="https://"
        />
        {errors.website && <p className="text-xs text-red-500 px-1">{errors.website}</p>}
      </div>

      {/* STATISTICS */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Current Badge</p>
          <h2 className="text-xl font-black text-gray-800 mt-0.5">
            {profile ? getBadgeName(profile.lifetime_vxp) : '-'}
          </h2>
        </div>
        <div className="h-10 border-l border-gray-100 hidden sm:block" />
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Progress Info</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-gray-400">({Math.round(levelData.progress)}%)</span>
            <h2 className="text-xl font-black text-[#bda752]">Lv.{levelData.level}</h2>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-2xl bg-[#bda752] hover:bg-[#a69243] disabled:opacity-50 disabled:cursor-not-allowed p-4 font-bold text-white shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
