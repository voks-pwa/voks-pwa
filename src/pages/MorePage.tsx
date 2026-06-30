import {
  Calendar,
  Mic2,
  Podcast,
  Radio,
  Globe,
  Share2,
  Star,
  Bell,
  Heart,
  Bookmark,
  ChevronRight,
  Trophy,
  Layers,
  Info,
  CheckCircle,
} from 'lucide-react'

import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa'

import { Link } from 'react-router-dom'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/features/auth/useAuth'

export function MorePage() {
  const { user } = useAuth()
  const { data: profile } = useProfile()

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'VOKS NEXT',
          text: 'Listen. Watch. Discover. Connect.',
          url: window.location.origin,
        })
        return
      }

      await navigator.clipboard.writeText(window.location.origin)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  // Desain dasar baris menu di dalam list kelompok
  const listRowItem =
    'flex items-center justify-between bg-white px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors first:rounded-t-2xl last:rounded-b-2xl group cursor-pointer'

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        
        {/* 1. LOGIN / REGISTER BANNER */}
        {!user && (
          <Link
            to="/login"
            className="mb-4 flex justify-center items-center gap-2 rounded-2xl bg-[#C1A85A] p-4 font-semibold text-white shadow-sm hover:bg-[#b0964b] transition-colors"
          >
            <span className="text-lg">👤</span> Login / Register
          </Link>
        )}

        {/* 2. VOKS HERO BRAND CARD */}
        <div className="mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#4E523C] to-[#3B3E2D] p-6 sm:p-8 text-white shadow-md relative">
          {/* Dekorasi Siluet Mikrofon di Sisi Kanan Atas */}
          <div className="absolute right-4 bottom-4 top-4 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-white">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
            </svg>
          </div>
          
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            VOKS NEXT
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            The Future of<br />Voks Radio
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Listen. Watch. Discover. Connect.
          </p>

          <div className="mt-8 flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-white/40 font-medium">Welcome Back</p>
              <p className="text-lg font-bold mt-0.5 tracking-wide">
                {user ? profile?.display_name ?? 'Teman Voks' : 'Guest'}
              </p>

              {user && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#C1A85A] px-3 py-0.5 text-xs font-semibold text-white">
                    {profile?.badge_name || 'Newbie'}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium">
                    {profile?.current_vxp ?? 0} VXP
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              Version 1.0.0
            </div>
          </div>
        </div>

        {/* USER PROFILE CARD (JIKA SUDAH LOGIN) */}
        {user && (
          <Link
            to="/profile"
            className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatar_url || '/default-avatar.png'}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div>
                <p className="font-bold text-gray-800">{profile?.display_name}</p>
                <p className="text-xs text-gray-400 font-medium">{profile?.badge_name || 'Member'}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        )}

        {/* 3. SECTION: MEMBERSHIP */}
        <div className="mb-6">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
            Membership
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link to="/missions" className={listRowItem}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <Trophy size={22} fill="currentColor" className="text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Mission Center</p>
                  <p className="text-xs text-gray-400">Complete missions and earn VXP</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>

            <Link to="/Rewards" className={listRowItem}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl shrink-0">
                  🎁
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Reward Store</p>
                  <p className="text-xs text-gray-400">Redeem your VXP</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          </div>
        </div>

        {/* 4. SECTION: YOUR EXPERIENCE (GRID LAYOUT) */}
        <div className="mb-6">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
            Your Experience
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Heart size={20} fill="currentColor" />, label: 'Favorite Programs', desc: 'Coming Soon', bg: 'bg-red-50', iconColor: 'text-red-500' },
              { icon: <Mic2 size={20} />, label: 'Favorite Hosts', desc: 'Coming Soon', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
              { icon: <Bell size={20} fill="currentColor" />, label: 'My Reminders', desc: 'Coming Soon', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
              { icon: <Bookmark size={20} fill="currentColor" />, label: 'Subscriptions', desc: 'Coming Soon', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.iconColor}`}>
                  {item.icon}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-800">{item.label}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. SECTION: EXPLORE (GROUPED CONTAINER) */}
        <div className="mb-6">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
            Explore
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[
              { to: '/programs', icon: <Radio size={20} />, text: 'Programs', bg: 'bg-indigo-50', color: 'text-indigo-500' },
              { to: '/schedule', icon: <Calendar size={20} />, text: 'Schedule', bg: 'bg-orange-50', color: 'text-orange-500' },
              { to: '/announcers', icon: <Mic2 size={20} />, text: 'Announcers', bg: 'bg-cyan-50', color: 'text-cyan-500' },
              { to: '/plus', icon: <Podcast size={20} />, text: 'Voks+', bg: 'bg-pink-50', color: 'text-pink-500' },
            ].map((link, idx) => (
              <Link key={idx} to={link.to} className={listRowItem}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${link.bg} ${link.color} shrink-0`}>
                    {link.icon}
                  </div>
                  <span className="font-bold text-sm text-gray-800">{link.text}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* 6. SECTION: CONNECT (GROUPED CONTAINER WITH BRAND COLORS) */}
        <div className="mb-6">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
            Connect
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[
              { href: 'https://instagram.com/voksradio', icon: <FaInstagram size={20} />, text: 'Instagram', bg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white' },
              { href: 'https://tiktok.com/@voksradio', icon: <FaTiktok size={20} />, text: 'TikTok', bg: 'bg-black text-white' },
              { href: 'https://youtube.com/@voksradio', icon: <FaYoutube size={20} />, text: 'YouTube', bg: 'bg-red-600 text-white' },
              { href: 'https://voksradio.com', icon: <Globe size={20} />, text: 'Website', bg: 'bg-blue-500 text-white' },
            ].map((socmed, idx) => (
              <a
                key={idx}
                href={socmed.href}
                target="_blank"
                rel="noreferrer"
                className={listRowItem}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${socmed.bg} shrink-0 shadow-sm`}>
                    {socmed.icon}
                  </div>
                  <span className="font-bold text-sm text-gray-800">{socmed.text}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </a>
            ))}
          </div>
        </div>

        {/* 7. SECTION: SUPPORT (GROUPED CONTAINER) */}
        <div className="mb-6">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
            Support
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link to="/notifications" className={listRowItem}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Bell size={20} fill="currentColor" />
                </div>
                <span className="font-bold text-sm text-gray-800">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>

            <button onClick={handleShare} className={`${listRowItem} w-full text-left`}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 shrink-0">
                  <Share2 size={20} />
                </div>
                <span className="font-bold text-sm text-gray-800">Share App</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>

            <button className={`${listRowItem} w-full text-left`}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <Star size={20} fill="currentColor" />
                </div>
                <span className="font-bold text-sm text-gray-800">Rate App</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* 8. SECTION: ABOUT VOKS RADIO */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            About Voks Radio
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-gray-500">
            Voks Radio is Bandung's Feel Good Radio, delivering music, entertainment,
            podcasts, visual radio, and engaging conversations for modern listeners.
          </p>

          <div className="mt-5 border-t border-gray-100 pt-4 space-y-3.5 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Layers size={16} />
                <span>Build</span>
              </div>
              <span className="font-bold text-gray-700">VOKS DIGITAL 2026</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Info size={16} />
                <span>Version</span>
              </div>
              <span className="font-bold text-gray-700">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle size={16} className="text-emerald-500" />
                <span>Status</span>
              </div>
              <span className="font-bold text-emerald-600">
                Beta (Public Release) 
              </span>
            </div>
          </div>
        </div>

      </div>
      <BottomNavigation />
    </div>
  )
}