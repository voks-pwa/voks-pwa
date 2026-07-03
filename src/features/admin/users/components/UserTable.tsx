import type { Profile } from "../types";

interface Props {
  users: Profile[];
  onSelect: (id: string) => void;
}

export function UserTable({
  users,
  onSelect,
}: Props) {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
      "
    >
      <table className="w-full">

        <thead className="border-b bg-gray-50">

          <tr className="text-left">

            <th className="px-6 py-4">User</th>

            <th className="px-4 py-4">Role</th>

            <th className="px-4 py-4">Badge</th>

            <th className="px-4 py-4">Level</th>

            <th className="px-4 py-4">Current VXP</th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <tr
              key={user.id}
              onClick={() => onSelect(user.id)}
              className="
                cursor-pointer
                border-b
                border-gray-100
                transition
                hover:bg-gray-50
              "
            >

              <td className="px-6 py-4">

                <div className="flex items-center gap-4">

                  <img
                    src={
                      user.avatar_url ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.display_name ?? "User"
                      )}`
                    }
                    alt={user.display_name ?? ""}
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  <div>

                    <div className="font-semibold">

                      {user.display_name ?? "Teman VOKS"}

                    </div>

                    <div className="text-sm text-gray-500">

                      {user.email}

                    </div>

                  </div>

                </div>

              </td>

              <td className="px-4 py-4">

                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    capitalize

                    ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }
                  `}
                >

                  {user.role ?? "member"}

                </span>

              </td>

              <td className="px-4 py-4">

                {user.badge_name ?? "-"}

              </td>

              <td className="px-4 py-4 font-bold">

                Lv.{user.level ?? 1}

              </td>

              <td className="px-4 py-4 font-black text-[#bda752]">

                {(user.current_vxp ?? 0).toLocaleString()}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}