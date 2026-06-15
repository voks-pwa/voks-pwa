import { useState } from 'react'

import { usePrograms } from '@/hooks/usePrograms'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { ProgramScheduleCard } from '@/components/programs/ProgramScheduleCard'

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

  const currentProgram =
    dayPrograms.find((program) => {
      const startParts =
        program.acf?.jam_mulai?.split(':') ??
        []

      const endParts =
        program.acf?.jam_selesai?.split(':') ??
        []

      const start =
        Number(startParts[0] ?? 0) * 60 +
        Number(startParts[1] ?? 0)

      const end =
        Number(endParts[0] ?? 0) * 60 +
        Number(endParts[1] ?? 0)

      return (
        currentTime >= start &&
        currentTime < end
      )
    })

  return (
    <>
      <div className="p-6 pb-24">
        <h1 className="mb-6 text-3xl font-bold">
          Schedule
        </h1>

        {/* DAY TABS */}

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
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
                transition
                ${
                  selectedDay === day
                    ? 'bg-[#bda752] text-black'
                    : 'bg-gray-100 text-gray-600'
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
              mb-8
              overflow-hidden
              rounded-3xl
              bg-[#bda752]
              text-black
              shadow
            "
          >
            <div className="p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                ON AIR NOW
              </div>

              <h2 className="text-2xl font-bold">
                {
                  currentProgram.title
                    .rendered
                }
              </h2>

              <p className="mt-1 text-sm">
                {currentProgram.acf?.host}
              </p>

              <p className="mt-2 text-sm font-medium">
                {
                  currentProgram.acf
                    ?.jam_mulai
                ?.slice(0, 5)
                }
                {' - '}
                {
                  currentProgram.acf
                    ?.jam_selesai
                ?.slice(0, 5)
                }
              </p>
            </div>
          </div>
        )}

        {/* DAY TITLE */}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {selectedDay}
          </h2>

          <span className="text-sm text-gray-500">
            {dayPrograms.length}{' '}
            Program
          </span>
        </div>

        {/* PROGRAM LIST */}

        {dayPrograms.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow">
            <p className="text-gray-500">
              Belum ada program untuk hari
              ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayPrograms.map((program) => (
              <ProgramScheduleCard
                key={program.id}
                program={program}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </>
  )
}