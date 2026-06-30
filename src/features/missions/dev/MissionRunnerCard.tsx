import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { runMission } from '../missionRunner'

export function MissionRunnerCard() {

  const { user } = useAuth()

  const [action, setAction] =
    useState('checkin')

  const [amount, setAmount] =
    useState(1)

  const [running, setRunning] =
    useState(false)

  async function run(actionName: string, value = 1) {

  if (!user) return

  setRunning(true)

  try {

    const result =
      await runMission({

        userId: user.id,

        action: actionName,

        amount: value,

      })

    console.log(
      'MISSION RESULT',
      result
    )

  } finally {

    setRunning(false)

  }

}

  return (

<section className="rounded-xl bg-white shadow p-6">

<h2 className="text-xl font-bold mb-6">

Mission Simulator

</h2>

<div className="grid md:grid-cols-3 gap-4">

<div>

<label className="text-sm font-medium">

Mission

</label>

<select

value={action}

onChange={(e)=>setAction(e.target.value)}

className="mt-2 w-full rounded border p-3"

>

<option value="checkin">Daily Checkin</option>

<option value="profile">Profile Complete</option>

<option value="referral">Referral</option>

<option value="listen">Listen Radio</option>

<option value="quiz">Quiz</option>

<option value="reminder">Reminder</option>

<option value="share">Share</option>

</select>

</div>

<div>

<label className="text-sm font-medium">

Amount

</label>

<input

type="number"

value={amount}

onChange={(e)=>

setAmount(Number(e.target.value))

}

className="mt-2 w-full rounded border p-3"

/>

</div>

<div className="flex items-end">

<button

disabled={running}

onClick={()=>run(action,amount)}

className="w-full rounded bg-blue-600 py-3 font-semibold text-white"

>

{running ? 'Running...' : 'Run Mission'}

</button>

</div>

</div>

<hr className="my-8"/>

<h3 className="font-semibold mb-4">

Quick Mission

</h3>

<div className="grid grid-cols-2 md:grid-cols-4 gap-3">

<button
onClick={()=>run('checkin')}
className="rounded bg-blue-600 py-3 text-white"
>

Checkin

</button>

<button
onClick={()=>run('profile')}
className="rounded bg-green-600 py-3 text-white"
>

Profile

</button>

<button
onClick={()=>run('referral')}
className="rounded bg-purple-600 py-3 text-white"
>

Referral

</button>

<button
onClick={()=>run('reminder')}
className="rounded bg-orange-600 py-3 text-white"
>

Reminder

</button>

<button
onClick={()=>run('listen',5)}
className="rounded bg-pink-600 py-3 text-white"
>

Listen 5

</button>

<button
onClick={()=>run('listen',30)}
className="rounded bg-pink-700 py-3 text-white"
>

Listen 30

</button>

<button
onClick={()=>run('quiz')}
className="rounded bg-indigo-600 py-3 text-white"
>

Quiz

</button>

<button
onClick={()=>run('share')}
className="rounded bg-slate-700 py-3 text-white"
>

Share

</button>

</div>

</section>

  )

}