import {
useEffect,
useState
}
from 'react'

import {
supabase
}
from '@/lib/supabase'

export function MissionLogCard({

userId,

}:{userId:string}){

const [logs,setLogs]=
useState<any[]>([])

useEffect(()=>{

load()

},[])

async function load(){

const {data}=

await supabase

.from('lifetime_vxp')

.select('*')

.eq('user_id',userId)

.order('created_at',{
ascending:false
})

setLogs(data??[])

}

return(

<section className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">

Mission Reward Log

</h2>

<div className="space-y-2">

{logs.map(item=>(

<div
key={item.id}
className="border rounded p-3"
>

<div>

{item.source}

</div>

<div>

+{item.amount} VXP

</div>

</div>

))}

</div>

</section>

)

}