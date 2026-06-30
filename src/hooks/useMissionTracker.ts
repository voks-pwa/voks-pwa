import { missionEngine }
from '@/features/missions'

export async function trackMission(args:any){

    return missionEngine(args)

}