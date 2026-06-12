import { getCurrentProgram, getNextProgram } from '@/lib/schedule'
import type { RadioProgram } from '@/lib/schedule'
import { programs } from '@/data/programs'

const radioSchedule = { programs: programs as RadioProgram[] }

function formatProgramTime(program: RadioProgram): string {
  return `${program.startTime} - ${program.endTime}`
}

export function CurrentShowCard() {
  const current = getCurrentProgram(radioSchedule)
  const next = getNextProgram(radioSchedule)

  return (
    <section className="w-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" />
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
                {formatProgramTime(current.program)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-text">No program on air</p>
              <p className="text-sm text-secondary">
                Tune in to see the next show.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/5 bg-slate-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary">
            <span>⏭</span>
            NEXT
          </div>

          {next ? (
            <div className="space-y-1">
              <p className="text-base font-semibold text-text">
                {next.program.name}
              </p>
              <p className="text-sm font-medium text-secondary">
                {formatProgramTime(next.program)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-secondary">No upcoming program available.</p>
          )}
        </div>
      </div>
    </section>
  )
}
