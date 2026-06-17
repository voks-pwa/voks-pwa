import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'
import { CurrentShowCard } from '@/components/programs/CurrentShowCard'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { useAnnouncers } from '@/hooks/useAnnouncers'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { FeaturedPrograms } from '@/components/programs/FeaturedPrograms'
import { useOwncastStatus } from '@/hooks/useOwncastStatus'

import 'swiper/css'


export function HomePage() {

  const { data: announcers } = useAnnouncers()
  const { data: owncast } =
  useOwncastStatus()

  return (
    <>
      <div className="pb-24">
        <AppLayout>
          <Header />

          <div className="flex w-full flex-col gap-6">
            {owncast?.online && (
  <Link
    to="/live"
    className="
      overflow-hidden
      rounded-3xl
      bg-[#5B5B3F]
      p-5
      text-white
      shadow
      transition
      hover:opacity-95
    "
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider">
          🔴 LIVE STUDIO NOW
        </p>

        <h2 className="text-xl font-bold">
          Watch Voks Visual Radio
        </h2>

        <p className="mt-1 text-sm text-white/80">
          Join the live video stream from our studio
        </p>
      </div>

      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-red-600
          text-lg
          font-bold
          animate-pulse
        "
      >
        LIVE
      </div>
    </div>
  </Link>
)}
            <CurrentShowCard />
           <Link
  to="/live"
  className="block rounded-3xl p-5 text-white shadow"
  style={{
    backgroundColor: '#5B5B3F',
  }}
>
  <div className="flex items-center gap-3">
    <span
      className="animate-pulse text-xl"
      style={{ color: '#bd5252' }}
    >
      ●
    </span>

    <div>
      <h2 className="font-bold">
        Live Studio
      </h2>

      <p className="text-sm text-white/80">
        Watch Voks Radio Visual Streaming
      </p>
    </div>
  </div>
</Link>
            <FeaturedPrograms />
            <AudioPlayerCard />
  
  <section className="rounded-3xl bg-white p-6 shadow">
  <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
    Featured Announcers
  </h2>

  <Swiper
  modules={[Autoplay]}
  spaceBetween={16}
  slidesPerView={2.5}
  autoplay={{
    delay: 3000,
    disableOnInteraction: false,
  }}
>
  {announcers?.map((announcer) => {
    const image =
      announcer._embedded?.['wp:featuredmedia']?.[0]
        ?.media_details?.sizes?.medium_large?.source_url ??
      announcer._embedded?.['wp:featuredmedia']?.[0]
        ?.source_url

    return (
      <SwiperSlide key={announcer.id}>
        <Link
          to={`/announcers/${announcer.slug}`}
          className="block"
        >
          <img
            src={image}
            alt={announcer.title.rendered}
            className="aspect-square w-full rounded-2xl object-cover"
          />

          <p className="mt-2 text-center text-sm font-medium">
            {announcer.title.rendered}
          </p>
        </Link>
      </SwiperSlide>
    )
  })}
</Swiper>
</section>
          </div>
        </AppLayout>
      </div>

      <BottomNavigation />
    </>
  )
}