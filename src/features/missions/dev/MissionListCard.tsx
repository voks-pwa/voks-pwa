import { useEffect, useState } from 'react'

import {
  getAllMissions,
} from '../missionWP'

import type {
  MissionConfig,
} from '../missionTypes'

export function MissionListCard() {

  const [missions, setMissions] =
    useState<MissionConfig[]>([])

  async function load() {

    const data =
        await getAllMissions()

    if (!data) {

        setMissions([])

        return

    }

    setMissions(data)

}

  useEffect(() => {

    load()

  }, [])

  return (

    <section className="rounded-xl bg-white shadow p-6">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-xl font-bold">

          Mission List (WordPress)

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

            <th>ID</th>

            <th>Action</th>

            <th>Target</th>

            <th>Reward</th>

            <th>Repeat</th>

            <th>Active</th>

          </tr>

        </thead>

        <tbody>

          {missions.map(m => (

            <tr
              key={m.id}
              className="border-b"
            >

              <td>{m.id}</td>

              <td>{m.action}</td>

              <td>{m.target}</td>

              <td>{m.reward}</td>

              <td>

                {m.repeat
                  ? '♻️'
                  : '-'}

              </td>

              <td>

                {m.active
                  ? '✅'
                  : '❌'}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </section>

  )

}