import { useMemo, useState } from "react";

import { useProfiles } from "@/features/profile";

import { UserSummary } from "../components/UserSummary";
import { UserTable } from "../components/UserTable";
import { UserToolbar } from "../components/UserToolbar";

import { UserDetailDrawer } from "../detail/UserDetailDrawer";

export function UsersPage() {

  const { data } = useProfiles();

  const [selectedUser, setSelectedUser] =
    useState<string>();

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const users = useMemo(() => data ?? [], [data]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const haystack = [
        user.display_name,
        user.email,
        user.role,
        user.badge_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (

    <div className="space-y-8">

      <div>

        <h1
          className="
            text-3xl
            font-black
          "
        >
          Users
        </h1>

        <p className="mt-2 text-gray-500">
          Manage all registered users.
        </p>

      </div>

      <UserSummary
        users={users}
      />

      <UserToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <UserTable
        users={pagedUsers}
        onSelect={(id) => {

          setSelectedUser(id);

          setDrawerOpen(true);

        }}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <UserDetailDrawer
        userId={selectedUser}
        open={drawerOpen}
        onClose={() => {

          setDrawerOpen(false);

          setSelectedUser(undefined);

        }}
      />

    </div>

  );

}