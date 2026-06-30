import { Link, useParams } from 'react-router-dom'

import {
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa'

import {
  Mic2,
  Radio,
  ArrowRight,
} from 'lucide-react'

import { useAnnouncer } from '@/hooks/useAnnouncer'
import { useProgramsByHost } from '@/hooks/useProgramsByHost'

export function AnnouncerDetailPage() {
  const { slug } = useParams()

  const {
    data: announcer,
    isLoading,
    error,
  } = useAnnouncer(slug)

  const { programs } =
    useProgramsByHost(
      announcer?.title.rendered
    )

  if (isLoading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  if (error || !announcer) {
    return (
      <div className="p-6">
        Announcer not found
      </div>
    )
  }

  const image =
    announcer._embedded?.[
      'wp:featuredmedia'
    ]?.[0]?.media_details?.sizes
      ?.medium_large?.source_url ??
    announcer._embedded?.[
      'wp:featuredmedia'
    ]?.[0]?.source_url

  return (
    <div className="pb-24">

      {/* HERO */}

      <div className="relative">

        {image && (
          <img
            src={image}
            alt={announcer.title.rendered}
            className="
              h-[-105px]
              w-full
              object-cover
            "
          />
        )}

        <div
          className="
            absolute
            inset-0
            bg-gradient-no-t
            from-black
            via-black/40
            to-transparent
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            p-6
            text-white
          "
        >

          <Link
            to="/announcers"
            className="
              mb-4
              inline-block
              text-sm
              text-white/80
            "
          >
            ← Back to Announcers
          </Link>

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-widest
              text-[#bda752]
            "
          >
            Voks Announcer
          </p>

          <h1
            className="
              mt-2
              text-4xl
              font-bold
            "
          >
            {announcer.title.rendered}
          </h1>

          <p className="mt-2 text-white/80">
            Radio Host • Voks Radio
          </p>

        </div>

      </div>

      <div className="mx-auto max-w-4xl p-6">

        {/* FOLLOW */}

        <div
          className="
            mb-8
            flex
            flex-wrap
            gap-3
          "
        >

          {announcer.acf?.link_instagram && (
            <a
              href={
                announcer.acf
                  .link_instagram
              }
              target="_blank"
              rel="noreferrer"
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-3xl
                bg-[#E1306C]
                px-5
                py-4
                font-semibold
                text-white
              "
            >
              <FaInstagram />

              Follow Instagram
            </a>
          )}

          {announcer.acf?.link_tiktok && (
            <a
              href={
                announcer.acf
                  .link_tiktok
              }
              target="_blank"
              rel="noreferrer"
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-3xl
                bg-black
                text-white
              "
            >
              <FaTiktok />
            </a>
          )}

        </div>

        {/* STATS */}

        <div
          className="
            mb-8
            grid
            grid-cols-2
            gap-4
          "
        >

          <div
            className="
              rounded-3xl
              bg-white
              p-6
              shadow
            "
          >
            <Radio
              size={24}
              className="
                mb-3
                text-[#bda752]
              "
            />

            <p className="text-3xl font-bold">
              {programs.length}
            </p>

            <p className="text-sm text-gray-500">
              Programs Hosted
            </p>
          </div>

          <div
            className="
              rounded-3xl
              bg-white
              p-6
              shadow
            "
          >
            <Mic2
              size={24}
              className="
                mb-3
                text-[#bda752]
              "
            />

            <p className="text-3xl font-bold">
              {
                Number(
                  !!announcer.acf
                    ?.link_instagram
                ) +
                Number(
                  !!announcer.acf
                    ?.link_tiktok
                )
              }
            </p>

            <p className="text-sm text-gray-500">
              Social Profiles
            </p>
          </div>

        </div>

        {/* ABOUT */}

        {announcer.acf
          ?.short_description && (
          <div
            className="
              mb-8
              rounded-3xl
              bg-white
              p-6
              shadow
            "
          >
            <h2
              className="
                mb-4
                text-xl
                font-bold
              "
            >
              About
            </h2>

            <p
              className="
                leading-8
                text-gray-700
              "
            >
              {
                announcer.acf
                  .short_description
              }
            </p>
          </div>
        )}

        {/* PROGRAMS */}

        {programs.length > 0 && (
          <>
            <h2
              className="
                mb-4
                text-xl
                font-bold
              "
            >
              Programs Hosted
            </h2>

            <div className="space-y-4">

              {programs.map(
                (program) => (
                  <Link
                    key={program.id}
                    to={`/programs/${program.slug}`}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-3xl
                      bg-white
                      p-5
                      shadow
                    "
                  >
                    <div>

                      <h3 className="font-semibold">
                        {
                          program
                            .title
                            .rendered
                        }
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                        "
                      >
                        {
                          program.acf
                            ?.jam_siaran
                        }
                      </p>

                    </div>

                    <ArrowRight
                      size={20}
                    />

                  </Link>
                )
              )}

            </div>
          </>
        )}

      </div>

    </div>
  )
}