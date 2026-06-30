import {
clearMissionLogs
}
from './missionLogger'

export function DeveloperToolsCard(){

return(

<section className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-6">

Developer Tools

</h2>

<div className="grid md:grid-cols-3 gap-4">

<button
className="rounded bg-blue-600 text-white py-3"
>

Reload Mission WP

</button>

<button
className="rounded bg-green-600 text-white py-3"
>

Refresh Dashboard

</button>

<button
onClick={()=>{

clearMissionLogs()

}}
className="rounded bg-slate-800 text-white py-3"
>

Clear Engine Log

</button>

<button
className="rounded bg-red-600 text-white py-3"
>

Reset XP

</button>

<button
className="rounded bg-red-600 text-white py-3"
>

Reset Mission Progress

</button>

<button
className="rounded bg-red-600 text-white py-3"
>

Reset Reminder

</button>

<button
className="rounded bg-indigo-600 text-white py-3"
>

Export Debug JSON

</button>

<button
className="rounded bg-orange-600 text-white py-3"
>

Seed Mission

</button>

<button
className="rounded bg-purple-600 text-white py-3"
>

Run Diagnostic

</button>

</div>

</section>

)

}