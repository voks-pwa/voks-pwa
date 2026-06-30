import { Link, useParams } from 'react-router-dom'
import { FaShareAlt } from 'react-icons/fa'
import {
  Bell,
  Clock3,
  Calendar,
  Mic2,
  Heart,
} from 'lucide-react'

import { useProgram } from '@/hooks/useProgram'
import { useAnnouncersByIds } from '@/hooks/useAnnouncer'
import { useReminder } from '@/hooks/useReminder'

export function ProgramDetailPage() {
  const { slug } = useParams()

  const {
    data: program,
    isLoading,
    error,
  } = useProgram(slug)

  const announcers =
    useAnnouncersByIds(
      program?.acf?.announcers
    )

  const {
    active,
    toggleReminder,
  } = useReminder(
    program?.slug,
    program?.title?.rendered,
    program?.acf?.jadwal_hari,
    program?.acf?.jam_mulai
  )

  if (isLoading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="p-6">
        Program not found
      </div>
    )
  }

  const image =
    program._embedded?.[
      'wp:featuredmedia'
    ]?.[0]?.source_url

  return (
    <div className="pb-24">

      {/* HERO */}

      <div className="relative">

        {image && (
          <img
            src={image}
            alt={program.title.rendered}
            className="
              h-[320px]
              w-full
              object-cover
            "
          />
        )}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black
            via-black/50
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
            to="/programs"
            className="
              mb-4
              inline-block
              text-sm
              text-white/80
            "
          >
            ← Back to Programs
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
            Program
          </p>

          <h1
            className="
              mt-2
              text-4xl
              font-bold
            "
          >
            {program.title.rendered}
          </h1>

          <p className="mt-2 text-white/80">
            {program.acf?.jadwal_hari}
            {' • '}
            {program.acf?.jam_siaran}
          </p>
        </div>

      </div>

      <div className="mx-auto max-w-4xl p-6">

        {/* ACTION BAR */}

        <div
          className="
            mb-8
            grid
            grid-cols-3
            gap-3
          "
        >

          <button
            onClick={toggleReminder}
            className={`
              flex
              flex-col
              items-center
              justify-center
              rounded-3xl
              p-4
              shadow
              ${
                active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white'
              }
            `}
          >
            <Bell size={20} />

            <span className="mt-2 text-xs">
              Reminder
            </span>
          </button>

          <button
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-3xl
              bg-white
              p-4
              shadow
            "
          >
            <Heart size={20} />

            <span className="mt-2 text-xs">
              Favorite
            </span>
          </button>

          <button
            onClick={async () => {
              const url =
                window.location.href

              if (navigator.share) {
                await navigator.share({
                  title:
                    program.title.rendered,
                  url,
                })
              } else {
                await navigator.clipboard.writeText(
                  url
                )

                alert(
                  'Link copied'
                )
              }
            }}
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-3xl
              bg-white
              p-4
              shadow
            "
          >
            <FaShareAlt />

            <span className="mt-2 text-xs">
              Share
            </span>
          </button>

        </div>

        {/* INFO CARD */}

        <div
          className="
            mb-8
            rounded-3xl
            bg-white
            p-6
            shadow
          "
        >

          <div className="space-y-5">

            <div className="flex gap-3">

              <Mic2
                size={20}
                className="text-[#bda752]"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Host
                </p>

                <p className="font-semibold">
                  {program.acf?.host ??
                    '-'}
                </p>
              </div>

            </div>

            <div className="flex gap-3">

              <Calendar
                size={20}
                className="text-[#bda752]"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Schedule
                </p>

                <p className="font-semibold">
                  {
                    program.acf
                      ?.jadwal_hari
                  }
                </p>
              </div>

            </div>

            <div className="flex gap-3">

              <Clock3
                size={20}
                className="text-[#bda752]"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Time
                </p>

                <p className="font-semibold">
                  {
                    program.acf
                      ?.jam_siaran
                  }
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ANNOUNCERS */}

        {announcers.length > 0 && (
          <>
            <h2
              className="
                mb-4
                text-xl
                font-bold
              "
            >
              Announcers
            </h2>

            <div className="mb-8 space-y-3">

              {announcers.map(
                (announcer) => (
                  <Link
                    key={announcer.id}
                    to={`/announcers/${announcer.slug}`}
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
                      <p className="font-semibold">
                        {
                          announcer
                            .title
                            .rendered
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        Voks Announcer
                      </p>
                    </div>

                    <span>
                      →
                    </span>

                  </Link>
                )
              )}

            </div>
          </>
        )}

        {/* CONTENT */}

        <div
          className="
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
            About Program
          </h2>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                program.content
                  .rendered,
            }}
          />
        </div>

      </div>

    </div>
  )
}