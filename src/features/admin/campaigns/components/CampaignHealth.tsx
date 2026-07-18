import { Shield, CheckCircle2, AlertCircle, AlertTriangle, Clock, Zap } from "lucide-react";
import { evaluateCampaigns } from "@/features/campaigns/services/campaignScheduler";
import { runCampaignHealthCheck } from "@/features/campaigns/services/campaignAutomation";
import { getCampaigns } from "@/features/campaigns/repositories/campaignRepository";
import { deriveCampaignStatus, isCampaignVisible, isEndingSoon, isArchived } from "@/features/campaigns/services/campaignStatus";
import { useQuery } from "@tanstack/react-query";

function HealthCard({ title, value, status, description, icon: Icon }: { title: string; value: string | number; status: "healthy" | "warning" | "error"; description: string; icon: typeof Shield }) {
  const statusColors = {
    healthy: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
  };
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusColors[status]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function CampaignHealth() {
  const { data: campaigns } = useQuery({
    queryKey: ["admin-campaigns-all"],
    queryFn: getCampaigns,
    staleTime: 30000,
  });

  const evaluation = campaigns ? evaluateCampaigns(campaigns, null) : { views: [], transitions: [], healthy: true, evaluatedAt: 0 };
  const fallbackHealth = { ok: true, issues: [] as string[], evaluatedAt: 0 };
  const health = campaigns ? runCampaignHealthCheck(evaluation) : fallbackHealth;

  const visibleCount = evaluation.views.filter((v) => isCampaignVisible(deriveCampaignStatus(v))).length;
  const endingSoonCount = evaluation.views.filter((v) => isEndingSoon(v)).length;
  const archivedCount = evaluation.views.filter((v) => isArchived(v)).length;
  const hiddenCount = evaluation.views.filter((v) => !isCampaignVisible(deriveCampaignStatus(v))).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <HealthCard
          title="Total Campaigns"
          value={evaluation.views.length}
          status="healthy"
          description={`${visibleCount} visible, ${hiddenCount} hidden`}
          icon={Shield}
        />
        <HealthCard
          title="Ending Soon"
          value={endingSoonCount}
          status={endingSoonCount > 0 ? "warning" : "healthy"}
          description="Within 24 hours of end"
          icon={Clock}
        />
        <HealthCard
          title="Archived"
          value={archivedCount}
          status={archivedCount > 0 ? "warning" : "healthy"}
          description="Past grace period"
          icon={AlertTriangle}
        />
        <HealthCard
          title="Health Checks"
          value={health.ok ? "Pass" : "Fail"}
          status={health.ok ? "healthy" : "error"}
          description={health.issues.length > 0 ? `${health.issues.length} issue(s)` : "All clear"}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Automation Status</h3>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Scheduler</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Running
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Last Evaluation</dt>
              <dd className="text-sm font-medium text-gray-900">
                {health.evaluatedAt ? new Date(health.evaluatedAt).toLocaleTimeString() : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Transitions Detected</dt>
              <dd className="text-sm font-medium text-gray-900">{evaluation.transitions.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Auto Start/End</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Enabled
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Auto Archive</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                After 7 days
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Ending Soon Alert</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                24h threshold
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Health Issues</h3>
          {health.issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="mt-2 text-gray-500">All health checks passed</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {health.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                  <span className="text-sm text-red-700">{issue}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Recent Transitions</h3>
        {evaluation.transitions.length === 0 ? (
          <p className="text-sm text-gray-500">No status transitions detected in this evaluation</p>
        ) : (
          <div className="space-y-2">
            {evaluation.transitions.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-amber-100">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.campaign.title}</p>
                    <p className="text-sm text-gray-500">{t.from} → {t.to}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  t.kind === "started" ? "bg-emerald-100 text-emerald-700" :
                  t.kind === "ending_soon" ? "bg-amber-100 text-amber-700" :
                  t.kind === "ended" ? "bg-slate-100 text-slate-700" :
                  t.kind === "archived" ? "bg-gray-100 text-gray-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {t.kind}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}