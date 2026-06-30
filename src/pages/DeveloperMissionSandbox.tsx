import { useAuth } from '@/features/auth/useAuth'

import { UserCard } from '@/features/missions/dev/UserCard'
import { MissionRunnerCard } from '@/features/missions/dev/MissionRunnerCard'
import { MissionProgressCard } from '@/features/missions/dev/MissionProgressCard'
import { MissionListCard } from '@/features/missions/dev/MissionListCard'
import { EngineLogCard } from '@/features/missions/dev/EngineLogCard'
import { DeveloperToolsCard } from '@/features/missions/dev/DeveloperToolsCard'
import { MissionHistoryCard } from '@/features/missions/dev/MissionHistoryCard'
import { MissionLogCard } from '@/features/missions/dev/MissionLogCard'
import { MissionResultCard } from '@/features/missions/dev/MissionResultCard'


export default function DeveloperMissionSandbox() {

    const { user } = useAuth()

    if (!user) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                Loading...

            </div>

        )

    }

    return (

<div className="min-h-screen bg-slate-100">

<header className="bg-slate-900 text-white shadow">

<div className="max-w-7xl mx-auto px-8 py-6">

<h1 className="text-3xl font-bold">

Mission Control Center

</h1>

<p className="text-slate-300">

Internal Developer Dashboard

</p>

</div>

</header>

<div className="max-w-7xl mx-auto p-6 grid gap-6">

<UserCard userId={user.id}/>

<MissionRunnerCard/>

<MissionResultCard/>

<MissionProgressCard userId={user.id}/>

<MissionHistoryCard userId={user.id}/>

<MissionLogCard userId={user.id}/>

<MissionListCard/>

<EngineLogCard/>

<DeveloperToolsCard/>

</div>

</div>

)

}