import {
  Calendar,
  Mic2,
  Radio,
  Podcast,
  Globe,
  Share2,
  Star,
  Music2,
  Video,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { FaInstagram, FaInstagramSquare, FaTiktok, FaYoutube } from 'react-icons/fa'

export function MorePage() {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Voks Radio',
        text: 'Listen to Voks Radio',
        url: window.location.origin,
      })

      return
    }

    navigator.clipboard.writeText(
      window.location.origin
    )

    alert('Link copied')
  }

  return (
    <>
      <div className="p-6 pb-24">

        {/* HEADER */}

        <div
          className="
            mb-6
            rounded-3xl
            bg-[#5B5B3F]
            p-6
            text-white
          "
        >
          <h1 className="text-3xl font-bold">
            Voks Radio
          </h1>

          <p className="mt-2 text-white/80">
            Feel Good
          </p>

          <p className="mt-4 text-xs text-white/60">
            Version 1.0.0
          </p>
        </div>

        {/* QUICK ACTIONS */}

        <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <Link
            to="/programs"
            className="rounded-3xl bg-white p-5 shadow"
          >
            <Radio size={24} />

            <p className="mt-3 font-semibold">
              Programs
            </p>
          </Link>

          <Link
            to="/schedule"
            className="rounded-3xl bg-white p-5 shadow"
          >
            <Calendar size={24} />

            <p className="mt-3 font-semibold">
              Schedule
            </p>
          </Link>

          <Link
            to="/announcers"
            className="rounded-3xl bg-white p-5 shadow"
          >
            <Mic2 size={24} />

            <p className="mt-3 font-semibold">
              Announcers
            </p>
          </Link>

          <Link
            to="/plus"
            className="rounded-3xl bg-white p-5 shadow"
          >
            <Podcast size={24} />

            <p className="mt-3 font-semibold">
              Voks+
            </p>
          </Link>

        </div>

        {/* SOCIAL */}

        <h2 className="mt-8 mb-4 text-sm font-semibold uppercase text-gray-500">
          Connect With Us
        </h2>

        <div className="space-y-3">

          <a
            href="https://instagram.com/voksradio"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow"
          >
            <FaInstagram size={20} />

            Instagram
          </a>

          <a
            href="https://tiktok.com/@voksradio"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow"
          >
            <FaTiktok size={20} />

            TikTok
          </a>

          <a
            href="https://www.youtube.com/@voksradio"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow"
          >
            <FaYoutube size={20} />

            YouTube
          </a>

          <a
            href="https://voksradio.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow"
          >
            <Globe size={20} />

            Website
          </a>

        </div>

        {/* SUPPORT */}

        <h2 className="mt-8 mb-4 text-sm font-semibold uppercase text-gray-500">
          Support
        </h2>

        <div className="space-y-3">

          <button
            onClick={handleShare}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              bg-white
              p-4
              shadow
            "
          >
            <Share2 size={20} />

            Share App
          </button>

          <button
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              bg-white
              p-4
              shadow
            "
          >
            <Star size={20} />

            Rate App
          </button>

        </div>

        {/* ABOUT */}

        <h2 className="mt-8 mb-4 text-sm font-semibold uppercase text-gray-500">
          About Voks Radio
        </h2>

        <div className="rounded-3xl bg-white p-5 shadow">

          <p className="text-sm leading-relaxed text-gray-600">
            Voks Radio is Bandung's Feel Good Radio,
            delivering music, entertainment,
            podcasts, visual radio, and engaging
            conversations for modern listeners.
          </p>

        </div>
<Link
  to="/notifications"
  className="
    rounded-3xl
    bg-white
    p-5
    shadow
  "
>
  🔔

  <p className="mt-3 font-semibold">
    Notifications
  </p>
</Link>
      </div>

      <BottomNavigation />
    </>
  )
}