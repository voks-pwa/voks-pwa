import type { Profile } from "../types";

interface Props{

user:Profile;

}

export function UserProfileCard({

user,

}:Props){

return(

<div
className="
rounded-3xl
bg-white
p-6
shadow-sm
"
>

<h3
className="
mb-6
font-bold
"
>

Profile

</h3>

<div
className="
grid
grid-cols-2
gap-5
"
>

<Item
label="Role"
value={user.role}
/>

<Item
label="Badge"
value={user.badge_name ?? "-"}
/>

<Item
label="Level"
value={`Lv.${user.level}`}
/>

<Item
label="Lifetime VXP"
value={(user.lifetime_vxp ?? 0).toLocaleString()}
/>

<Item
label="VXP"
value={user.current_vxp.toLocaleString()}
/>

<Item
label="City"
value={user.city ?? "-"}
/>

<Item
label="Phone"
value={user.phone ?? "-"}
/>

<Item
label="Gender"
value={user.gender ?? "-"}
/>

</div>

</div>

);

}

function Item({

label,

value,

}:{

label:string;

value:string;

}){

return(

<div>

<p
className="
text-xs
uppercase
tracking-wide
text-gray-400
"
>

{label}

</p>

<p
className="
mt-1
font-semibold
"
>

{value}

</p>

</div>

);

}