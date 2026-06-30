import type { AdminUser } from "../types";

interface Props {

  users: AdminUser[];

}

export function UserSummary({

  users,

}: Props) {

  const admins =
    users.filter(
      u => u.role === "admin"
    ).length;

  const members =
    users.filter(
      u => u.role === "member"
    ).length;

  const averageLevel =
    users.length === 0
      ? 0
      : (
          users.reduce(
            (a,b)=>
              a+b.level,
            0
          ) /
          users.length
        ).toFixed(1);

  return (

    <div
      className="
        mb-8
        grid
        grid-cols-4
        gap-5
      "
    >

      <Card
        title="Users"
        value={users.length}
      />

      <Card
        title="Admins"
        value={admins}
      />

      <Card
        title="Members"
        value={members}
      />

      <Card
        title="Avg Level"
        value={averageLevel}
      />

    </div>

  );

}

function Card({

  title,

  value,

}:{

  title:string;

  value:string|number;

}){

  return(

<div
className="
rounded-3xl
bg-white
p-6
shadow-sm
"
>

<p className="text-gray-500">

{title}

</p>

<h2 className="mt-3 text-3xl font-black">

{value}

</h2>

</div>

);

}