import {
  useEffect,
} from 'react'

import {
  subscribeMissionEvent,
} from './missionEventBus'

import {
  runMission,
} from './missionRunner'

export function useMissionEventBus() {

  useEffect(() => {

    const unsubscribe =
      subscribeMissionEvent(

        async event => {

          console.log(
            'MISSION EVENT RECEIVED',
            event
          )

          await runMission({

            userId:
              event.userId,

            action:
              event.action,

            amount:
              event.amount,

          })

        }

      )

    return unsubscribe

  }, [])

}