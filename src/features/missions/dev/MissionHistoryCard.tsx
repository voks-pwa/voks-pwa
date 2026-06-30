import {
useEffect,
useState
}
from 'react'

import {
supabase
}
from '@/lib/supabase'

export function MissionHistoryCard({

userId,

}:{userId:string}){

const [history,setHistory]=
useState<any[]>([])

useEffect(()=>{

load()

},[])

async function load(){

const {data}=

await supabase

.from('missions_progress')

.select('*')

.eq('user_id',userId)

.order('completed_at',{
ascending:false
})

setHistory(data??[])

}

return(

<section className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">

Mission History

</h2>

<div className="space-y-2">

{history.map(item=>(

<div
key={item.id}
className="border rounded p-3"
>

<div>

Mission

{item.mission_id}

</div>

<div>

Progress

{item.progress}

</div>

<div>

Completed

{String(item.completed)}

</div>

</div>

))}

</div>

</section>

)

}