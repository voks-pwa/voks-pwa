import {
  useEffect,
  useState,
} from 'react'

import {
  getMissionLogs,
  subscribeMissionLog,
} from './missionLogger'

export function EngineLogCard() {

  const [logs, setLogs] =
    useState(getMissionLogs())

  useEffect(() => {

    const unsubscribe =
      subscribeMissionLog(() => {

        setLogs([
          ...getMissionLogs(),
        ])

      })

    return unsubscribe

  }, [])

  return (

    <section className="bg-black rounded-xl shadow p-6">

      <h2 className="text-white font-bold text-xl mb-4">

        Engine Log

      </h2>

      <div className="space-y-3 max-h-125 overflow-auto">

        {logs.length === 0 && (

          <div className="text-green-500 text-sm">

            No Log Yet

          </div>

        )}

        {logs.map((log, index) => (

          <div

            key={index}

            className="border-b border-slate-800 pb-3"

          >

            <div className="text-green-500 text-xs">

              {log.time}

            </div>

            <div className="text-white font-semibold">

              {log.title}

            </div>

            <pre className="text-green-400 text-xs whitespace-pre-wrap break-all">

              {JSON.stringify(
                log.payload,
                null,
                2
              )}

            </pre>

          </div>

        ))}

      </div>

    </section>

  )

}