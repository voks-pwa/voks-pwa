import { Link } from 'react-router-dom'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

import 'swiper/css'

import { usePrograms } from '@/hooks/usePrograms'

export function FeaturedPrograms() {
  const { data: programs } = usePrograms()

  if (!programs?.length) {
    return null
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
        Featured Programs
      </h2>

      <Swiper
        modules={[Autoplay]}
        slidesPerView={2.2}
        spaceBetween={16}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop
      >
        {programs.map((program) => {
          const image =
            program._embedded?.['wp:featuredmedia']?.[0]
              ?.media_details?.sizes?.medium_large?.source_url ??
            program._embedded?.['wp:featuredmedia']?.[0]
              ?.source_url

          return (
            <SwiperSlide key={program.id}>
              <Link
                to={`/programs/${program.slug}`}
                className="block"
              >
                {image && (
                  <img
                    src={image}
                    alt={program.title.rendered}
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                )}

                <h3 className="mt-2 text-sm font-semibold">
                  {program.title.rendered}
                </h3>

                <p className="text-xs text-gray-500">
                  {program.acf?.host}
                </p>
              </Link>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
}