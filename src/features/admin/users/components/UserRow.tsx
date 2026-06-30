import type { AdminUser } from "../types";

interface Props {
  user: AdminUser;
}

export function UserRow({
  user,
}: Props) {
  return (
    <tr className="border-b last:border-none hover:bg-gray-50">

      {/* USER */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-4">

          <img
            src={
              user.avatar_url ??
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(
                  user.display_name ?? "User"
                )
            }
            alt={user.display_name ?? ""}
            className="
              h-12
              w-12
              rounded-full
              object-cover
            "
          />

          <div>

            <p className="font-semibold">

              {user.display_name ?? "-"}

            </p>

            <p className="text-sm text-gray-500">

              {user.email}

            </p>

          </div>

        </div>

      </td>

      {/* ROLE */}

      <td className="px-4 py-4">

        <span
          className={`
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold

            ${
              user.role === "admin"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }
          `}
        >
          {user.role}
        </span>

      </td>

      {/* BADGE */}

      <td className="px-4 py-4">

        {user.badge_name}

      </td>

      {/* LEVEL */}

      <td className="px-4 py-4">

        <span className="font-bold">

          Lv.{user.level}

        </span>

      </td>

      {/* CURRENT VXP */}

      <td className="px-4 py-4">

        <span className="font-black text-[#bda752]">

          {user.current_vxp.toLocaleString()}

        </span>

      </td>

    </tr>
  );
}