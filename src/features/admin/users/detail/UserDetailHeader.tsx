import type { Profile } from "@/features/profile";
interface Props{

user:Profile;

}

export function UserDetailHeader({

user,

}:Props){

return(

<div
className="
mb-8
flex
items-center
gap-5
"
>

<img

src={
user.avatar_url ??
`https://ui-avatars.com/api/?name=${encodeURIComponent(
user.display_name ??
"User"
)}`
}

className="
h-20
w-20
rounded-full
object-cover
"
/>

<div>

<h2
className="
text-2xl
font-black
"
>

{user.display_name}

</h2>

<p
className="
text-gray-500
"
>

{user.email}

</p>

</div>

</div>

);

}