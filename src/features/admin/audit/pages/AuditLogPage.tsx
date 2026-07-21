import { useState } from "react";
import { Search, RefreshCw, ShieldAlert } from "lucide-react";
import { useAuditLogs } from "@/features/operations";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const limit = 100;

  const { data: logs, isLoading, isError, refetch } = useAuditLogs(limit);

  const filtered = logs?.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Audit Log</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by action, entity, or actor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
        />
      </div>

      <div className="rounded-2xl border bg-white">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-400">Loading audit logs...</div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-red-600">
            Failed to load audit logs.
            <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            {search ? "No entries match your search" : "No audit log entries yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-3 pl-6 pr-4 pt-3">Time</th>
                  <th className="pb-3 pr-4 pt-3">Actor</th>
                  <th className="pb-3 pr-4 pt-3">Action</th>
                  <th className="pb-3 pr-4 pt-3">Entity</th>
                  <th className="pb-3 pr-4 pt-3">Entity ID</th>
                  <th className="pb-3 pr-6 pt-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="whitespace-nowrap py-3 pl-6 pr-4 text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium">{entry.actor_name || "—"}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{entry.entity}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{entry.entity_id || "—"}</td>
                    <td className="py-3 pr-6 text-xs text-gray-500">{entry.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <ShieldAlert size={14} />
        Showing up to {limit} most recent entries
      </div>
    </div>
  );
}
