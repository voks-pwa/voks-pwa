import { useState } from "react";
import { CalendarClock, Send, AlertTriangle } from "lucide-react";
import {
  useAdminScheduledJobs,
  useAdminQueue,
  useAdminDeadQueue,
  useAdminRequeueDead,
} from "../hooks/useAdminAutomation";
import type { JobStatus, QueueStatus } from "@/features/automation/types";

const JOB_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-100",
  CLAIMED: "text-blue-600 bg-blue-100",
  DONE: "text-green-600 bg-green-100",
  FAILED: "text-red-600 bg-red-100",
};

const QUEUE_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-100",
  CLAIMED: "text-blue-600 bg-blue-100",
  SENT: "text-green-600 bg-green-100",
  FAILED: "text-orange-600 bg-orange-100",
  DEAD: "text-red-600 bg-red-100",
};

const TABS = [
  { key: "jobs", label: "Scheduler", icon: CalendarClock },
  { key: "queue", label: "Queue", icon: Send },
  { key: "dead", label: "Dead Letter", icon: AlertTriangle },
];

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("jobs");

  const { data: jobs, isLoading: jLoading } = useAdminScheduledJobs();
  const { data: queue, isLoading: qLoading } = useAdminQueue();
  const { data: dead, isLoading: dLoading } = useAdminDeadQueue();
  const requeue = useAdminRequeueDead();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Automation</h1>

      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "jobs" && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Scheduled Jobs</h2>
          {jLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Reference</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Attempts</th>
                  <th className="pb-2 pr-4">Run At</th>
                  <th className="pb-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {(!jobs || jobs.length === 0) ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No scheduled jobs</td></tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-xs">{job.job_type}</td>
                      <td className="py-3 pr-4 text-xs">{job.reference_id || "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${JOB_COLORS[job.status as JobStatus] ?? ""}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs">{job.attempts}/{job.max_attempts}</td>
                      <td className="py-3 pr-4 text-xs">{new Date(job.run_at).toLocaleString()}</td>
                      <td className="py-3 pr-4 text-xs text-red-500">{job.last_error || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "queue" && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Notification Queue</h2>
          {qLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">Channel</th>
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 pr-4">User</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Attempts</th>
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {(!queue || queue.length === 0) ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Queue is empty</td></tr>
                ) : (
                  queue.slice(0, 100).map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-xs">{item.channel}</td>
                      <td className="py-3 pr-4">{item.title}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{item.user_id ? item.user_id.slice(0, 8) + "..." : "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${QUEUE_COLORS[item.status as QueueStatus] ?? ""}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs">{item.attempts}/{item.max_attempts}</td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "dead" && (
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Dead Letter Queue</h2>
            <button
              onClick={() => requeue.mutate()}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Requeue All Dead
            </button>
          </div>
          {dLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">Channel</th>
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 pr-4">Attempts</th>
                  <th className="pb-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {(!dead || dead.length === 0) ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No dead letters</td></tr>
                ) : (
                  dead.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-xs">{item.channel}</td>
                      <td className="py-3 pr-4">{item.title}</td>
                      <td className="py-3 pr-4 text-xs">{item.attempts}/{item.max_attempts}</td>
                      <td className="py-3 pr-4 text-xs text-red-500">{item.last_error || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
