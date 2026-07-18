import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";

import { AdminDataTable } from "@/features/admin/shared/AdminDataTable";
import { exportToCSV } from "@/features/admin/shared/AdminExportCSV";
import { useDebounce } from "@/features/admin/shared/useDebounce";
import { useUsers } from "../hooks/useUser";
import { UserToolbar } from "../components/UserToolbar";

export function UsersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, error } = useUsers({ search: debouncedSearch, role: roleFilter, page, pageSize });

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setPage(1);
  };

  const handleExport = () => {
    if (!data?.users) return;
    exportToCSV(data.users as unknown as Record<string, unknown>[], {
      id: "ID",
      display_name: "Display Name",
      email: "Email",
      role: "Role",
      level: "Level",
      current_vxp: "Current VXP",
      lifetime_vxp: "Lifetime VXP",
      badge_name: "Badge",
      created_at: "Joined",
    }, "users.csv");
  };

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Failed to load users: {String(error)}
      </div>
    );
  }

  const columns = [
    {
      key: "display_name",
      label: "User",
      sortable: true,
      className: "min-w-[200px]",
      render: (item: Record<string, unknown>) => {
        const u = item as { avatar_url?: string; display_name?: string; email?: string };
        return (
          <div className="flex items-center gap-3">
            <img
              src={u.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.display_name ?? "User")}&background=bda752&color=fff`}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{u.display_name ?? "Unknown"}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "badge_name",
      label: "Badge",
      render: (item: Record<string, unknown>) => (
        <span className="text-sm">{String(item.badge_name ?? "-")}</span>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (item: Record<string, unknown>) => (
        <span className="font-semibold">Lv.{Number(item.level)}</span>
      ),
    },
    {
      key: "current_vxp",
      label: "Current",
      render: (item: Record<string, unknown>) => (
        <span className="font-mono">{Number(item.current_vxp).toLocaleString()}</span>
      ),
    },
    {
      key: "lifetime_vxp",
      label: "Lifetime",
      render: (item: Record<string, unknown>) => (
        <span className="font-mono">{Number(item.lifetime_vxp).toLocaleString()}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item: Record<string, unknown>) => {
        const role = String(item.role ?? "member");
        const colors: Record<string, string> = {
          superadmin: "bg-red-100 text-red-700",
          admin: "bg-blue-100 text-blue-700",
          member: "bg-gray-100 text-gray-600",
        };
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[role] ?? "bg-gray-100 text-gray-600"}`}>
            {role}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Users</h1>
          <p className="text-gray-500">
            {data?.total != null
              ? `${data.total} total users`
              : "Manage platform users"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#bda752]"
          >
            <option value="">All Roles</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!data?.users?.length}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <UserToolbar search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} />

      <AdminDataTable
        columns={columns}
        data={(data?.users ?? []) as unknown as Record<string, unknown>[]}
        keyExtractor={(item) => String(item.id)}
        page={page}
        pageSize={pageSize}
        total={data?.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onRowClick={(item) => {
          console.log("[AUDIT-1] UUID from User List:");
          console.log("  user.id       :", item.id);
          console.log("  user.user_id  :", (item as Record<string, unknown>).user_id);
          console.log("  user.auth_user_id:", (item as Record<string, unknown>).auth_user_id);
          console.log("  user.email    :", (item as Record<string, unknown>).email);
          console.log("[AUDIT-2] navigate to:", `/admin/users/${item.id}`);
          navigate(`/admin/users/${item.id}`);
        }}
        isLoading={isLoading}
        emptyMessage="No users found matching your search."
      />
    </div>
  );
}
