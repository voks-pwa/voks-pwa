import { create } from "zustand"

import type {
  MissionConfig,
} from "./missionTypes"

export interface MissionProgressState {
  missionId: number

  progress: number

  target: number

  completed: boolean

  claimed: boolean

  reward: number
}

interface MissionStore {

  missions: MissionConfig[]

  progress: Record<number, MissionProgressState>

  latestReward: MissionProgressState | null

  totalReward: number

  unreadReward: number

  loading: boolean

  lastSync: number | null

  setLoading(
    loading: boolean
  ): void

  setMissions(
    missions: MissionConfig[]
  ): void

  setProgress(
    progress: MissionProgressState
  ): void

  completeMission(
    missionId: number
  ): void

  claimReward(
    missionId: number
  ): void

  clearLatestReward(): void

  reset(): void
}

export const useMissionStore =
create<MissionStore>((set,)=>({

  missions:[],

  progress:{},

  latestReward:null,

  totalReward:0,

  unreadReward:0,

  loading:false,

  lastSync:null,

  setLoading(loading){

    set({loading})

  },

  setMissions(missions){

    set({

      missions,

      lastSync:Date.now(),

    })

  },

  setProgress(progress){

    set(state=>{

      const previous =
        state.progress[
          progress.missionId
        ]

      const completedNow =
        !previous?.completed &&
        progress.completed

      return{

        progress:{
          ...state.progress,

          [progress.missionId]:
            progress,

        },

        latestReward:
          completedNow
            ? progress
            : state.latestReward,

        unreadReward:
          completedNow
            ? state.unreadReward+1
            : state.unreadReward,

      }

    })

  },

  completeMission(id){

    set(state=>{

      const current =
        state.progress[id]

      if(!current){

        return state

      }

      return{

        progress:{
          ...state.progress,

          [id]:{

            ...current,

            completed:true,

          },

        },

      }

    })

  },

  claimReward(id){

    set(state=>{

      const current =
        state.progress[id]

      if(!current){

        return state

      }

      return{

        totalReward:
          state.totalReward+
          current.reward,

        unreadReward:
          Math.max(
            0,
            state.unreadReward-1
          ),

        progress:{
          ...state.progress,

          [id]:{

            ...current,

            claimed:true,

          },

        },

      }

    })

  },

  clearLatestReward(){

    set({

      latestReward:null,

    })

  },

  reset(){

    set({

      missions:[],

      progress:{},

      latestReward:null,

      totalReward:0,

      unreadReward:0,

      loading:false,

      lastSync:null,

    })

  },

}))