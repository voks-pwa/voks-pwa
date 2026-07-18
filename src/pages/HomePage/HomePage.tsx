import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { FaPlay } from 'react-icons/fa'

import { Header } from '@/components/layout/Header'
import { BrandHeader } from '@/components/home/BrandHeader'
import { QuickAccess } from '@/components/home/QuickAccess'
import { HostsSlider } from '@/components/home/HostsSlider'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'
import { PromoBanner } from '@/components/ui/PromoBanner'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { MissionWidget } from '@/features/missions/components/MissionWidget'
import { isFeatureEnabled } from '@/features/flags'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useVoksPlus } from '@/hooks/useVoksPlus'
import { usePrograms } from '@/hooks/usePrograms'

import 'swiper/css'

export function HomePage() {
  const { data: voksPlus } = useVoksPlus()
  const { data: programs } = usePrograms()

  return (
    <>
      <Header />

      <div className="flex w-full flex-col gap-6">
        <BrandHeader />

        <PromoBanner />

        <NotificationCenter />

        {isFeatureEnabled("mission") && <MissionWidget />}

        <QuickAccess />

        <AudioPlayerCard />

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <SectionHeader title="Voks+" label="Premium Content" viewAllLink="/plus" />
          <div className="mt-5">
            <Swiper modules={[Autoplay]} spaceBetween={16} slidesPerView={1.15}>
              {voksPlus?.map((item) => {
                const image =
                  item._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium_large?.source_url ??
                  item._embedded?.['wp:featuredmedia']?.[0]?.source_url

                return (
                  <SwiperSlide key={item.id}>
                    <Link to={`/plus/${item.slug}`} className="block">
                      <div className="overflow-hidden rounded-3xl bg-gray-50">
                        <div className="relative">
                          {image && (
                            <img
                              src={image}
                              alt={item.title.rendered}
                              className="aspect-video w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute left-4 top-4">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                              {item.acf?.content_type}
                            </span>
                          </div>
                          <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                            <FaPlay />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-2 text-lg font-bold">{item.title.rendered}</h3>
                          <p className="mt-2 text-sm text-gray-600">{item.acf?.guest_name}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">{item.acf?.duration}</span>
                            <span className="text-xs font-semibold text-primary">Watch Now</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
        </section>

        <section>
          <SectionHeader title="Programs" label="All Shows" viewAllLink="/programs" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            {programs?.slice(0, 4).map((program) => {
              const image =
                program._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium_large?.source_url ??
                program._embedded?.['wp:featuredmedia']?.[0]?.source_url

              return (
                <Link
                  key={program.id}
                  to={`/programs/${program.slug}`}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    {image && (
                      <img
                        src={image}
                        alt={program.title.rendered}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-bold">{program.title.rendered}</h3>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{program.acf?.jam_siaran}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <HostsSlider />
      </div>
    </>
  )
}
