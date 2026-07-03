import { useAdminAudit } from './useAdminAudit';

export function AuditLogPanel() {
  const { data: entries = [], isLoading } = useAdminAudit(10);

  if (isLoading) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading audit log…</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Audit Log</h2>
          <p className="text-sm text-gray-500">Recent admin activity</p>
        </div>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            No admin activity recorded yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-200 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{entry.action}</span>
                <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-gray-600">
                {entry.entity} · {entry.entityId ?? '—'}
              </p>
              {entry.details ? <p className="mt-1 text-gray-500">{entry.details}</p> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
