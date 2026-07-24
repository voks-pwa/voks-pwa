import type { AdminUser } from "../types";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface Props {
  users: AdminUser[];
}

export function UserTable({ users }: Props) {
  console.log(users);
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 text-left">User</th>
            <th>Badge</th>
            <th>Level</th>
            <th>Current</th>
            <th>Lifetime</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <OptimizedImage
                    src={user.avatar_url ?? "https://placehold.co/80"}
                    className="h-10 w-10 rounded-full"
                    alt=""
                  />

                  <div>
                    <div className="font-semibold">
                      {user.display_name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>

              <td>{user.badge_name}</td>

              <td>Lv.{user.level}</td>

              <td>{user.current_vxp}</td>

              <td>{user.lifetime_vxp}</td>

              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}