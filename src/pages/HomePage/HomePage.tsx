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
import { useVoksPlus } from '@/hooks/useVoksPlus'
import { FaPlay } from 'react-icons/fa'
import { Search } from 'lucide-react'
import {  NotificationCenter,} from '@/components/notifications/NotificationCenter'
import {
  TodayScheduleWidget,
} from '@/components/programs/TodayScheduleWidget'

import 'swiper/css'


export function HomePage() {
  
  const { data: voksPlus } =
  useVoksPlus()

console.log(voksPlus)

  const { data: announcers } = useAnnouncers()
  const { data: owncast } =
  useOwncastStatus()

  return (
    <>
      <div className="pb-24">
        <AppLayout>
          <Header />

          <Link
  to="/search"
  className="
    flex
    items-center
    gap-3
    rounded-3xl
    bg-white
    px-5
    py-4
    shadow
  "
>
  <Search size={20} />

  <span className="text-gray-500">
    Search programs, hosts, podcasts...
  </span>
</Link>

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
            <TodayScheduleWidget />
            <NotificationCenter />
           
            <FeaturedPrograms />
            <AudioPlayerCard />

            <section className="rounded-3xl bg-white p-6 shadow">

  <div className="mb-5 flex items-center justify-between">

    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Voks+
      </p>

      <h2 className="text-xl font-bold">
        Latest Episodes
      </h2>
    </div>

    <Link
      to="/plus"
      className="text-sm font-medium text-primary"
    >
      View All
    </Link>

  </div>

  <Swiper
    modules={[Autoplay]}
    spaceBetween={16}
    slidesPerView={1.15}
  >
    {voksPlus?.map((item) => {

      const image =
        item._embedded?.['wp:featuredmedia']?.[0]
          ?.media_details?.sizes?.medium_large
          ?.source_url ??
        item._embedded?.['wp:featuredmedia']?.[0]
          ?.source_url

      return (
        <SwiperSlide key={item.id}>

          <Link
            to={`/plus/${item.slug}`}
            className="block"
          >

            <div className="overflow-hidden rounded-3xl bg-gray-50">

              <div className="relative">

                {image && (
                  <img
                    src={image}
                    alt={item.title.rendered}
                    className="aspect-video w-full object-cover"
                  />
                )}

                <div
                  className="
                    absolute
                    inset-0
                    bg-black/20
                  "
                />

                <div
                  className="
                    absolute
                    left-4
                    top-4
                  "
                >
                  <span
                    className="
                      rounded-full
                      bg-white
                      px-3
                      py-1
                      text-xs
                      font-semibold
                    "
                  >
                    {item.acf?.content_type}
                  </span>
                </div>

                <div
                  className="
                    absolute
                    bottom-4
                    right-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600
                    text-white
                    shadow-lg
                  "
                >
                  <FaPlay />
                </div>

              </div>

              <div className="p-4">

                <h3
                  className="
                    line-clamp-2
                    text-lg
                    font-bold
                  "
                >
                  {item.title.rendered}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {item.acf?.guest_name}
                </p>

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-xs
                      font-medium
                      text-gray-500
                    "
                  >
                    {item.acf?.duration}
                  </span>

                  <span
                    className="
                      text-xs
                      font-semibold
                      text-primary
                    "
                  >
                    Watch Now
                  </span>

                </div>

              </div>

            </div>

          </Link>

        </SwiperSlide>
      )
    })}
  </Swiper>

</section>
  
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