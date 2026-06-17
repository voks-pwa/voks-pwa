import { useState } from 'react'

import { usePrograms } from '@/hooks/usePrograms'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'

const DAYS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

export function SchedulePage() {
  const { data: programs, isLoading } =
    usePrograms()

  const [selectedDay, setSelectedDay] =
    useState('Senin')

  if (isLoading) {
    return (
      <div className="p-6">
        Loading schedule...
      </div>
    )
  }

  const dayPrograms =
    programs
      ?.filter((program) =>
        program.acf?.hari?.includes(
          selectedDay
        )
      )
      .sort((a, b) =>
        (a.acf?.jam_mulai ?? '').localeCompare(
          b.acf?.jam_mulai ?? ''
        )
      ) ?? []

  const now = new Date()

  const currentTime =
    now.getHours() * 60 + now.getMinutes()

  const currentIndex =
    dayPrograms.findIndex((program) => {
      const start =
        Number(
          program.acf?.jam_mulai?.split(
            ':'
          )[0]
        ) *
          60 +
        Number(
          program.acf?.jam_mulai?.split(
            ':'
          )[1]
        )

      const end =
        Number(
          program.acf?.jam_selesai?.split(
            ':'
          )[0]
        ) *
          60 +
        Number(
          program.acf?.jam_selesai?.split(
            ':'
          )[1]
        )

      return (
        currentTime >= start &&
        currentTime < end
      )
    })

  const currentProgram =
    currentIndex >= 0
      ? dayPrograms[currentIndex]
      : null

  const nextProgram =
    currentIndex >= 0
      ? dayPrograms[currentIndex + 1]
      : null

  return (
    <>
      <div className="p-6 pb-24">

        <div className="mb-6">

          <h1 className="text-3xl font-bold">
            Schedule
          </h1>

          <p className="mt-1 text-gray-500">
            Today's radio lineup
          </p>

        </div>

        {/* DAY CHIPS */}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">

          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() =>
                setSelectedDay(day)
              }
              className={`
                whitespace-nowrap
                rounded-full
                px-4
                py-2
                text-sm
                font-medium
                ${
                  selectedDay === day
                    ? 'bg-[#5B5B3F] text-white'
                    : 'bg-white text-gray-600 shadow'
                }
              `}
            >
              {day}
            </button>
          ))}

        </div>

        {/* LIVE NOW */}

        {currentProgram && (
          <div
            className="
              mb-4
              rounded-3xl
              bg-[#5B5B3F]
              p-6
              text-white
            "
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider">
              🔴 LIVE NOW
            </p>

            <h2 className="text-2xl font-bold">
              {
                currentProgram.title
                  .rendered
              }
            </h2>

            <p className="mt-2 text-white/80">
              {
                currentProgram.acf
                  ?.host
              }
            </p>

            <p className="mt-2 text-sm">
              {
                currentProgram.acf
                  ?.jam_mulai
              }
              {' - '}
              {
                currentProgram.acf
                  ?.jam_selesai
              }
            </p>

          </div>
        )}

        {/* NEXT UP */}

        {nextProgram && (
          <div
            className="
              mb-6
              rounded-3xl
              bg-white
              p-5
              shadow
            "
          >
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Up Next
            </p>

            <h3 className="font-bold">
              {
                nextProgram.title
                  .rendered
              }
            </h3>

            <p className="text-sm text-gray-500">
              {
                nextProgram.acf
                  ?.jam_mulai
              }
              {' - '}
              {
                nextProgram.acf
                  ?.jam_selesai
              }
            </p>

          </div>
        )}

        {/* TIMELINE */}

        <div className="space-y-5">

          {dayPrograms.map((program) => {

            const active =
              currentProgram?.id ===
              program.id

            return (
              <div
                key={program.id}
                className="flex gap-4"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`
                      h-4
                      w-4
                      rounded-full
                      ${
                        active
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      }
                    `}
                  />

                  <div className="h-full w-px bg-gray-200" />

                </div>

                <div
                  className={`
                    flex-1
                    rounded-3xl
                    p-5
                    ${
                      active
                        ? 'bg-[#F7F5EC]'
                        : 'bg-white shadow'
                    }
                  `}
                >

                  <div className="mb-2 flex items-center justify-between">

                    <h3 className="font-bold">
                      {
                        program.title
                          .rendered
                      }
                    </h3>

                    {active && (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                        LIVE
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-600">
                    {
                      program.acf
                        ?.host
                    }
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {
                      program.acf
                        ?.jam_mulai
                    }
                    {' - '}
                    {
                      program.acf
                        ?.jam_selesai
                    }
                  </p>

                </div>

              </div>
            )
          })}

        </div>

      </div>

      <BottomNavigation />
    </>
  )
}