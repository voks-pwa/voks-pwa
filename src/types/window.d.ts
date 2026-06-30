import type {
  MissionRuntime,
} from '@/features/missions/missionRuntime'

declare global {

  interface Window {

    missionRuntime: {

      startListening(
        userId: string
      ): void

      stopListening(
        userId: string
      ): void

      addListening(
        userId: string,
        seconds: number
      ): void

      resetListening(
        userId: string
      ): void

      getRuntime(
        userId: string
      ): MissionRuntime | undefined

    }

  }

}

export {}