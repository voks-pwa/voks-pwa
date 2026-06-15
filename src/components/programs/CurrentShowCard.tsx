import { usePrograms } from '@/hooks/usePrograms'

import {
  getCurrentProgram,
  getNextProgram,
  type RadioProgram,
} from '@/lib/schedule'

import { buildSchedule } from '@/lib/program-schedule'

function formatProgramTime(
  program: RadioProgram
): string {
  return `${program.startTime} - ${program.endTime}`
}

export function CurrentShowCard() {
  const {
    data: programs,
    isLoading,
    error,
  } = usePrograms()

  if (isLoading) {
    return (
      <section className="w-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        Loading schedule...
      </section>
    )
  }

  if (error || !programs) {
    return (
      <section className="w-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        Failed to load schedule
      </section>
    )
  }

  const schedule = buildSchedule(programs)

const current = getCurrentProgram(schedule)

const next = getNextProgram(schedule)

const currentProgramData = programs.find(
  (program) =>
    program.title.rendered === current?.program.name
)

const banner = currentProgramData?._embedded?.[
  'wp:featuredmedia'
]?.[0]?.source_url

  return (
    <section className="w-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      {banner && (
  <img
    src={banner}
    alt={current?.program.name}
    className="mb-6 aspect-video w-full rounded-2xl object-cover"
  />
)}
      <div className="flex flex-col gap-6">

        {/* CURRENT PROGRAM */}

        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
            <span
              className="h-2.5 w-2.5 rounded-full bg-red-600"
              aria-hidden="true"
            />
            ON AIR
          </div>

          {current ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-text sm:text-2xl">
                {current.program.name}
              </h2>

              <p className="text-sm font-medium text-secondary">
                {current.program.host}
              </p>

              <p className="text-sm font-semibold text-primary">
                {formatProgramTime(
                  current.program
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-text">
                No program on air
              </p>

              <p className="text-sm text-secondary">
                Tune in to see the next show.
              </p>
            </div>
          )}
        </div>

        {/* NEXT PROGRAM */}

        <div className="rounded-3xl border border-black/5 bg-slate-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary">
            <span>⏭</span>
            NEXT PROGRAM
          </div>

          {next ? (
            <div className="space-y-1">
              <p className="text-base font-semibold text-text">
                {next.program.name}
              </p>

              <p className="text-sm font-medium text-secondary">
                {next.program.host}
              </p>

              <p className="text-sm font-semibold text-primary">
                {formatProgramTime(
                  next.program
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-secondary">
              No upcoming program available.
            </p>
          )}
        </div>

      </div>
    </section>
  )
}