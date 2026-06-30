import { useEffect, useState } from 'react'

import {
  getMissionResult,
  subscribeMissionResult,
  type MissionResult,
} from './missionResultStore'

export function MissionResultCard() {
  const [result, setResult] =
    useState<MissionResult | null>(
      getMissionResult()
    )

  useEffect(() => {
    return subscribeMissionResult(() => {
      setResult(getMissionResult())
    })
  }, [])

  return (
    <section className="rounded-xl bg-white shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        Mission Result
      </h2>

      {!result && (
        <div className="text-gray-400">
          No Mission Executed
        </div>
      )}

      {result && (
        <div className="space-y-3">

          <div>
            <b>Mission :</b> {result.mission}
          </div>

          <div>
            <b>Action :</b> {result.action}
          </div>

          <div>
            <b>Success :</b> {String(result.success)}
          </div>

          <div>
            <b>Completed :</b> {String(result.completed)}
          </div>

          <div>
            <b>Progress :</b> {result.progress}
          </div>

          <div>
            <b>Reward :</b> +{result.reward} VXP
          </div>

          {result.message && (
            <div>
              <b>Status :</b> {result.message}
            </div>
          )}

        </div>
      )}

    </section>
  )
}