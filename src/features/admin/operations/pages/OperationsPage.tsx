import { useState } from "react";
import { Activity, Wrench, Database, Globe, Smartphone } from "lucide-react";
import { useSystemHealth, useMaintenanceConfig, useUpdateMaintenance, useAppVersion } from "@/features/operations";

const TABS = [
  { key: "health", label: "System Health", icon: Activity },
  { key: "maintenance", label: "Maintenance Mode", icon: Wrench },
  { key: "version", label: "Version Info", icon: Smartphone },
];

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("health");
  const { data: health, isLoading: hLoading, isError: hError, refetch: hRefetch } = useSystemHealth();
  const { data: maintenance, isLoading: mLoading } = useMaintenanceConfig();
  const { data: version } = useAppVersion();
  const updateMaintenance = useUpdateMaintenance();

  const [mmEnabled, setMmEnabled] = useState(false);
  const [mmMessage, setMmMessage] = useState("");
  const [mmDirty, setMmDirty] = useState(false);
  const mmDisplayEnabled = mmDirty ? mmEnabled : (maintenance?.enabled ?? false);
  const mmDisplayMessage = mmDirty ? mmMessage : (maintenance?.message ?? "");

  const handleSaveMaintenance = () => {
    updateMaintenance.mutate({ enabled: mmDisplayEnabled, message: mmDisplayMessage });
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Operations</h1>

      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "health" && (
        <div className="space-y-4">
          {hLoading ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-gray-400">Loading system health...</div>
          ) : hError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
              Failed to load system health.
              <button onClick={() => hRefetch()} className="ml-2 underline">Retry</button>
            </div>
          ) : health ? (
            <>
              <div className={`rounded-2xl border p-6 ${health.status === "healthy" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full ${health.status === "healthy" ? "bg-green-500" : "bg-yellow-500"}`} />
                  <div>
                    <p className="text-lg font-bold uppercase">{health.status}</p>
                    <p className="text-sm text-gray-500">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Database size={18} className="text-blue-600" />
                    <h3 className="font-bold">Database</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={health.database.connected ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {health.database.connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response Time</span>
                      <span className="font-mono">{health.database.response_time_ms}ms</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      {Object.entries(health.database.tables).map(([table, count]) => (
                        <div key={table} className="flex justify-between py-0.5">
                          <span className="text-gray-500">{table}</span>
                          <span className="font-mono">{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Globe size={18} className="text-purple-600" />
                    <h3 className="font-bold">WordPress API</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={health.wordpress.connected ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {health.wordpress.connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response Time</span>
                      <span className="font-mono">{health.wordpress.response_time_ms}ms</span>
                    </div>
                    {health.wordpress.error && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Error</span>
                        <span className="text-red-600">{health.wordpress.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Maintenance Mode</h2>
          {mLoading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="mm-enabled"
                  checked={mmDisplayEnabled}
                  onChange={(e) => { setMmEnabled(e.target.checked); setMmDirty(true); }}
                  className="h-5 w-5 rounded"
                />
                <label htmlFor="mm-enabled" className="text-sm font-medium">Enable Maintenance Mode</label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Maintenance Message</label>
                <textarea
                  value={mmDisplayMessage}
                  onChange={(e) => { setMmMessage(e.target.value); setMmDirty(true); }}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
                  rows={3}
                  placeholder="Message displayed to users during maintenance..."
                />
              </div>

              <button
                onClick={() => {
                  handleSaveMaintenance();
                  setMmDirty(false);
                }}
                disabled={updateMaintenance.isPending}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMaintenance.isPending ? "Saving..." : "Save"}
              </button>

              {updateMaintenance.isSuccess && (
                <p className="text-sm text-green-600">Maintenance mode updated.</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "version" && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Application Version</h2>
          {version ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Version</p>
                <p className="mt-1 text-2xl font-black">v{version.version}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Build Number</p>
                <p className="mt-1 text-2xl font-black">#{version.build_number}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Build Date</p>
                <p className="mt-1 text-2xl font-black">{version.build_date ? new Date(version.build_date).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Loading...</div>
          )}
        </div>
      )}
    </div>
  );
}
