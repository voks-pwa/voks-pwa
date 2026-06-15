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
  const { data: programs, isLoading } = usePrograms()

  if (isLoading) {
    return (
      <div className="p-6">
        Loading schedule...
      </div>
    )
  }

  return (
    <>
      <div className="p-6 pb-24">
        <h1 className="mb-8 text-3xl font-bold">
          Schedule
        </h1>

        {DAYS.map((day) => {
          const dayPrograms =
            programs
              ?.filter((program) =>
                program.acf?.hari?.includes(day)
              )
              .sort((a, b) =>
                (a.acf?.jam_mulai ?? '').localeCompare(
                  b.acf?.jam_mulai ?? ''
                )
              ) ?? []

          if (!dayPrograms.length) {
            return null
          }

          return (
            <section
              key={day}
              className="mb-10"
            >
              <h2 className="mb-4 text-xl font-bold">
                {day}
              </h2>

              <div className="space-y-4">
                {dayPrograms.map((program) => (
                  <ProgramScheduleCard
                    key={program.id}
                    program={program}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <BottomNavigation />
    </>
  )
}