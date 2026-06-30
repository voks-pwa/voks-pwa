import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ProgressRow = {
  id: number
  mission_id: number
  progress: number
  completed: boolean
  claimed: boolean
}

export function MissionProgressCard({
  userId,
}: {
  userId: string
}) {
  const [rows, setRows] =
    useState<ProgressRow[]>([])

  async function load() {
    const { data } =
      await supabase
        .from('missions_progress')
        .select('*')
        .eq('user_id', userId)
        .order('mission_id')

    setRows(data ?? [])
  }

  useEffect(() => {
    load()
  }, [userId])

  return (
    <section className="rounded-xl bg-white shadow p-6">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-xl font-bold">
          Mission Progress
        </h2>

        <button
          onClick={load}
          className="rounded bg-slate-700 px-3 py-2 text-white"
        >
          Reload
        </button>

      </div>

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b">

            <th className="text-left py-2">
              Mission
            </th>

            <th>
              Progress
            </th>

            <th>
              Complete
            </th>

            <th>
              Claimed
            </th>

          </tr>

        </thead>

        <tbody>

          {rows.map(row => (

            <tr
              key={row.id}
              className="border-b"
            >

              <td className="py-2">

                {row.mission_id}

              </td>

              <td className="text-center">

                {row.progress}

              </td>

              <td className="text-center">

                {row.completed
                  ? '✅'
                  : '❌'}

              </td>

              <td className="text-center">

                {row.claimed
                  ? '🎁'
                  : '-'}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </section>
  )
}