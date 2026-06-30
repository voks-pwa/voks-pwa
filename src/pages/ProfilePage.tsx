import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { calculateCompletion } from '@/features/profile/profileHelpers'
import { useProfile } from '@/hooks/useProfile' 
import { addXP } from '@/features/xp/addXP'
import { getLevelProgress } from '@/features/xp/levelHelpers'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUserRank } from '@/lib/getUserRank'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile } = useProfile()

  console.log('PROFILE', profile)

  // State Form Profil
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('') 
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Menghitung data Level dan Rank Akumulasi VXP
  const levelData = getLevelProgress(profile?.vxp ?? 0)
  const rank = getUserRank(profile?.lifetime_vxp ?? 0)
  const lifetime = profile?.lifetime_vxp ?? 0

  // Tautan Referral Link
  const referralLink = `${window.location.origin}/login?ref=${profile?.referral_code ?? ''}`

  const progressPercent =
    rank.max === Infinity
      ? 100
      : (((profile?.lifetime_vxp ?? 0) - rank.min) / (rank.max - rank.min)) * 100

  // Logika render gambar avatar (Mendukung http/https eksternal & path Supabase internal)
  const getAvatarSrc = () => {
    if (!profile?.avatar_url) {
      return user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? 'https://placehold.co/200'
    }

    // Cek jika menggunakan tautan url eksternal utuh (seperti googleusercontent)
    if (/^https?:\/\//i.test(profile.avatar_url)) {
      return profile.avatar_url
    }

    // Jika menggunakan internal Supabase Storage path
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
    return data.publicUrl
  }

  const nextLevelLabel =
    rank.level === 1
      ? 'Teman Voks'
      : rank.level === 2
      ? 'Voks Aktif'
      : rank.level === 3
      ? 'Penikmat Frekuensi'
      : rank.level === 4
      ? 'Voks Addict'
      : rank.level === 5
      ? 'Penguasa Gelombang'
      : rank.level === 6
      ? 'Voks Maniac'
      : rank.level === 7
      ? 'Voks Royalty'
      : rank.level === 8
      ? 'Voks Legend'
      : null

  // Sinkronisasi data ke state saat profil berhasil dimuat
  useEffect(() => {
    if (!profile) return

    setDisplayName(profile.display_name ?? '')
    setGender(profile.gender ?? '') 
    setPhone(profile.phone ?? '')
    setCity(profile.city ?? '')
    setBio(profile.bio ?? '')
    setBirthDate(profile.birth_date ?? '')
  }, [profile])

  async function handleLogout() {
    const confirmed = window.confirm('Logout dari akun?')
    if (!confirmed) return
    await supabase.auth.signOut()
    navigate('/')
  }

  const completion = profile ? calculateCompletion(profile) : 0

 async function saveProfile() {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      gender,
      phone,
      city,
      bio,
      birth_date: birthDate,
    })
    .eq('id', user!.id)

  if (error) {
    alert(error.message)
    return
  }

  // Ambil profile TERBARU setelah update
  const {
    data: latestProfile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (profileError) {
    console.error(profileError)
    alert('Failed to reload profile')
    return
  }

  const latestCompletion =
    calculateCompletion(latestProfile)

  console.log(
    'LATEST COMPLETION',
    latestCompletion
  )

  if (
    latestCompletion === 100 &&
    !latestProfile.profile_reward_claimed
  ) {

    console.log(
      'PROFILE COMPLETE REWARD'
    )

    await addXP(
      user!.id,
      100,
      'profile_complete'
    )

    await supabase
      .from('profiles')
      .update({
        profile_reward_claimed: true,
      })
      .eq('id', user!.id)

  }

  alert('Profile Saved')
}

  // Proteksi render jika user belum terautentikasi
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6">
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

  return (
    <div className="min-h-screen bg-[#F7F6F2] p-4 sm:p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        
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

        {/* MEMBER CARD */}
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#4E523C] to-[#3B3E2D] p-6 text-white shadow-xl">
          <div className="flex items-center gap-5">
            <img
              src={getAvatarSrc()}
              alt="avatar"
              onError={(e) => {
                console.log('AVATAR ERROR', profile?.avatar_url)
                e.currentTarget.src = 'https://placehold.co/200'
              }}
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

          {/* PROGRESS BAR RANK */}
          <div className="mt-5">
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {rank.max !== Infinity && (
              <div className="mt-2 flex justify-between text-[11px] text-white/80 font-medium">
                <span>Menuju {nextLevelLabel}</span>
                <span>{lifetime.toLocaleString()} / {(rank.max + 1).toLocaleString()} VXP</span>
              </div>
            )}
          </div>

          {/* VXP GRID INDICATOR */}
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

          {/* REFERRAL LINK CONTAINER (Pindah ke posisi kontras & terlindung) */}
          {profile?.referral_code && (
            <div className="rounded-2xl bg-white/10 border border-white/5 p-4 mt-5 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Referral Link
              </p>
              <p className="mt-1.5 break-all text-xs font-medium text-white/90 bg-black/10 p-2.5 rounded-xl border border-black/5 select-all">
                {referralLink}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink)
                  alert('Referral link copied!')
                }}
                className="mt-3 rounded-xl bg-[#bda752] hover:bg-[#a69243] active:scale-98 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
              >
                Copy Link
              </button>
            </div>
          )}

        </div>

        {/* PROFILE COMPLETION BOX */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100">
          <div className="mb-2 flex justify-between text-xs sm:text-sm font-bold text-gray-700">
            <span>Profile Completion</span>
            <span className="text-[#bda752]">{completion}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-[#bda752] transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* FORM FIELD EDIT PROFILE */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Gender</label>
            <input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="Gender"
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors text-gray-700"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              className="mt-1 h-28 w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#bda752] transition-colors resize-none"
            />
          </div>

          <button
            onClick={saveProfile}
            className="w-full rounded-2xl bg-[#bda752] hover:bg-[#a69243] p-4 font-bold text-white shadow-sm transition-colors mt-2"
          >
            Save Profile
          </button>
        </div>

        {/* METRIK BADGE & LEVEL INFO */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Current Badge</p>
            <h2 className="text-xl font-black text-gray-800 mt-0.5">{profile?.badge_name || '-'}</h2>
          </div>

          <div className="h-10 border-l border-gray-100 hidden sm:block"></div>

          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Progress Info</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-gray-400">({Math.round(levelData.progress)}%)</span>
              <h2 className="text-xl font-black text-[#bda752]">Lv.{levelData.currentLevel}</h2>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}