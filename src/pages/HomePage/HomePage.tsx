import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'
import { CurrentShowCard } from '@/components/programs/CurrentShowCard'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { usePrograms } from '@/hooks/usePrograms'
import { useAnnouncers } from '@/hooks/useAnnouncers'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { FeaturedPrograms } from '@/components/programs/FeaturedPrograms'

import 'swiper/css'
import { MdFeaturedPlayList } from 'react-icons/md'

export function HomePage() {
  const { data: programs } = usePrograms()
  const currentProgram = programs?.[0]
  const nextProgram = programs?.[1]
  const { data: announcers } = useAnnouncers()
  return (
    <>
      <div className="pb-24">
        <AppLayout>
          <Header />

          <div className="flex w-full flex-col gap-6">
            <CurrentShowCard />
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