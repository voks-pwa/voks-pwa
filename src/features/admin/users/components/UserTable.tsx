import type { AdminUser } from "../types";
import { UserRow } from "./UserRow";

interface Props {
  users: AdminUser[];
}

export function UserTable({
  users,
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

            <th className="px-6 py-4">
              User
            </th>

            <th className="px-4 py-4">
              Role
            </th>

            <th className="px-4 py-4">
              Badge
            </th>

            <th className="px-4 py-4">
              Level
            </th>

            <th className="px-4 py-4">
              VXP
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map(user => (

            <UserRow
              key={user.id}
              user={user}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}