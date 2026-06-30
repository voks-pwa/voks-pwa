import { useUsers } from "../users/hooks/useUsers";

import { UserSummary } from "../users/components/UserSummary";

import { UserTable } from "../users/components/UserTable";

export function UsersPage(){

const {

data,

isLoading,

}=useUsers();

if(isLoading){

return <div>Loading...</div>;

}

return(

<div>

<h1
className="
mb-8
text-3xl
font-black
"
>

Users

</h1>

<UserSummary

users={data??[]}

/>

<UserTable

users={data??[]}

/>

</div>

);

}