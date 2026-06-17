import { Link } from 'react-router-dom'

import { usePrograms } from '@/hooks/usePrograms'

const DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

export function TodayScheduleWidget() {
  const { data } =
    usePrograms()

  const today =
    DAYS[new Date().getDay()]

  const programs =
    data
      ?.filter((program) =>
        program.acf?.hari?.includes(
          today
        )
      )
      .sort((a, b) =>
        (
          a.acf?.jam_mulai ?? ''
        ).localeCompare(
          b.acf?.jam_mulai ?? ''
        )
      )
      .slice(0, 3) ?? []

  if (!programs.length) {
    return null
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">

      <div className="mb-4 flex items-center justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Today
          </p>

          <h2 className="text-xl font-bold">
            Schedule
          </h2>
        </div>

        <Link
          to="/schedule"
          className="text-sm font-medium text-primary"
        >
          View All
        </Link>

      </div>

      <div className="space-y-3">

        {programs.map((program) => (
          <div
            key={program.id}
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              bg-gray-50
              p-4
            "
          >
            <div>

              <p className="font-semibold">
                {
                  program.title
                    .rendered
                }
              </p>

              <p className="text-sm text-gray-500">
                {program.acf?.host}
              </p>

            </div>

            <span
              className="
                text-sm
                font-semibold
                text-[#bda752]
              "
            >
              {
                program.acf
                  ?.jam_mulai
              }
            </span>

          </div>
        ))}

      </div>

    </section>
  )
}