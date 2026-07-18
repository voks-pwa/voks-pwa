import type { TopUser } from "../types/dashboard";

interface Props {
  users: TopUser[];
}

export default function TopUsersTable({
  users,
}: Props) {
  return (
    <div className="rounded-3xl bg-white shadow-lg overflow-hidden">

      <div className="border-b px-6 py-5">

        <h2 className="text-xl font-black">
          Top Users
        </h2>

        <p className="text-sm text-gray-500">
          Ranking berdasarkan Lifetime VXP
        </p>

      </div>

      <table className="w-full">

        <thead className="bg-gray-50">

          <tr>

            <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
              User
            </th>

            <th className="text-left text-xs font-bold uppercase text-gray-500">
              Badge
            </th>

            <th className="text-center text-xs font-bold uppercase text-gray-500">
              Level
            </th>

            <th className="px-6 text-right text-xs font-bold uppercase text-gray-500">
              Lifetime VXP
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <tr
              key={user.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >

              <td className="px-6 py-4">

                <div className="flex items-center gap-3">

                  <img
                    src={
                      user.avatar_url ??
                      "https://placehold.co/80"
                    }
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  <div>

                    <h3 className="font-bold">
                      {user.display_name ??
                        "Unknown"}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {user.id}
                    </p>

                  </div>

                </div>

              </td>

              <td>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">

                  {user.badge_name ??
                    "-"}

                </span>

              </td>

              <td className="text-center font-bold">

                Lv.{user.level}

              </td>

              <td className="px-6 text-right text-lg font-black text-[#bda752]">

                {user.lifetime_vxp.toLocaleString()}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}