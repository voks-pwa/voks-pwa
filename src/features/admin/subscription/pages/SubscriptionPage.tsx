import { useState } from "react";
import { Crown, CreditCard, Receipt, Plus } from "lucide-react";
import {
  useAdminSubscriptionPlans,
  useAdminSubscriptions,
  useAdminInvoices,
  useAdminSubscriptionAnalytics,
  useAdminCancelSubscription,
  useAdminChangePlan,
  useAdminCreatePlan,
} from "../hooks/useAdminSubscription";
import type { PlanCode, BillingInterval } from "@/features/subscription/types";

const TABS = [
  { key: "plans", label: "Plans", icon: Crown },
  { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { key: "invoices", label: "Invoices", icon: Receipt },
];

const SUB_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-600 bg-green-100",
  GRACE: "text-yellow-600 bg-yellow-100",
  EXPIRED: "text-red-600 bg-red-100",
  CANCELLED: "text-gray-600 bg-gray-100",
  PAUSED: "text-blue-600 bg-blue-100",
};

const PLAN_CODES: PlanCode[] = ["FREE", "PREMIUM", "VIP", "CORPORATE"];
const BILLING_INTERVALS: BillingInterval[] = ["MONTHLY", "QUARTERLY", "YEARLY"];

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planCode: "PREMIUM" as PlanCode,
    name: "",
    billingInterval: "MONTHLY" as BillingInterval,
    price: 0,
    description: "",
  });
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [newPlanId, setNewPlanId] = useState("");

  const { data: plans, isLoading: pLoading } = useAdminSubscriptionPlans();
  const { data: subscriptions, isLoading: sLoading } = useAdminSubscriptions();
  const { data: invoices, isLoading: iLoading } = useAdminInvoices();
  const { data: analytics, isLoading: aLoading } = useAdminSubscriptionAnalytics();

  const cancelSub = useAdminCancelSubscription();
  const changePlan = useAdminChangePlan();
  const createPlan = useAdminCreatePlan();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Subscription & Membership</h1>

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

      {activeTab === "plans" && (
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Plans</h2>
            <button
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              <Plus size={14} /> Add Plan
            </button>
          </div>

          {showAddPlan && (
            <div className="mb-6 grid grid-cols-5 gap-3 rounded-xl bg-gray-50 p-4">
              <select
                value={newPlan.planCode}
                onChange={(e) => setNewPlan({ ...newPlan, planCode: e.target.value as PlanCode })}
                className="rounded-lg border px-2 py-1.5 text-sm"
              >
                {PLAN_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                className="rounded-lg border px-2 py-1.5 text-sm"
              />
              <select
                value={newPlan.billingInterval}
                onChange={(e) => setNewPlan({ ...newPlan, billingInterval: e.target.value as BillingInterval })}
                className="rounded-lg border px-2 py-1.5 text-sm"
              >
                {BILLING_INTERVALS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                className="rounded-lg border px-2 py-1.5 text-sm"
              />
              <button
                onClick={() => {
                  if (newPlan.name.trim()) {
                    createPlan.mutate({
                      planCode: newPlan.planCode,
                      name: newPlan.name,
                      billingInterval: newPlan.billingInterval,
                      price: newPlan.price,
                      description: newPlan.description,
                    });
                    setNewPlan({ planCode: "PREMIUM", name: "", billingInterval: "MONTHLY", price: 0, description: "" });
                    setShowAddPlan(false);
                  }
                }}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          )}

          {pLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Interval</th>
                  <th className="pb-2 pr-4">Price</th>
                  <th className="pb-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {(!plans || plans.length === 0) ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No plans yet</td></tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{p.plan_code}</td>
                      <td className="py-3 pr-4">{p.name}</td>
                      <td className="py-3 pr-4 text-xs">{p.billing_interval}</td>
                      <td className="py-3 pr-4">{p.price.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "text-green-600 bg-green-100" : "text-gray-500 bg-gray-100"}`}>
                          {p.is_active ? "YES" : "NO"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">User Subscriptions</h2>
          {aLoading && !analytics ? null : analytics ? (
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="rounded-xl border p-4">
                <p className="text-xs uppercase text-gray-500">Total</p>
                <p className="text-xl font-black">{analytics.total_subscriptions}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-xs uppercase text-gray-500">Active</p>
                <p className="text-xl font-black">{analytics.active_subscriptions}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-xs uppercase text-gray-500">Revenue</p>
                <p className="text-xl font-black">{analytics.total_revenue.toLocaleString()}</p>
              </div>
            </div>
          ) : null}

          {sLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">User</th>
                  <th className="pb-2 pr-4">Plan</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Period End</th>
                  <th className="pb-2 pr-4">Auto Renew</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!subscriptions || subscriptions.length === 0) ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No subscriptions yet</td></tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{sub.user_id.slice(0, 8)}...</td>
                      <td className="py-3 pr-4 text-xs">{sub.plan_id.slice(0, 8)}...</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SUB_STATUS_COLORS[sub.status] ?? ""}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs">{new Date(sub.current_period_end).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 text-xs">{sub.auto_renew ? "YES" : "NO"}</td>
                      <td className="py-3">
                        {sub.status !== "CANCELLED" && (
                          <div className="flex gap-2">
                            {editingSub === sub.id ? (
                              <>
                                <select
                                  value={newPlanId}
                                  onChange={(e) => setNewPlanId(e.target.value)}
                                  className="rounded-lg border px-2 py-1 text-xs"
                                >
                                  <option value="">Select plan...</option>
                                  {(plans ?? []).map((p) => <option key={p.id} value={p.id}>{p.plan_code}</option>)}
                                </select>
                                <button
                                  onClick={() => {
                                    if (newPlanId) {
                                      changePlan.mutate({ subscriptionId: sub.id, newPlanId });
                                      setEditingSub(null);
                                      setNewPlanId("");
                                    }
                                  }}
                                  className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                  Apply
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingSub(sub.id)}
                                  className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium hover:bg-gray-200"
                                >
                                  Change
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Cancel this subscription?")) {
                                      cancelSub.mutate(sub.id);
                                    }
                                  }}
                                  className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Billing History</h2>
          {iLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">User</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Method</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Period</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {(!invoices || invoices.length === 0) ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No invoices yet</td></tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{inv.user_id.slice(0, 8)}...</td>
                      <td className="py-3 pr-4 font-medium">{inv.amount.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-xs">{inv.payment_method}</td>
                      <td className="py-3 pr-4 text-xs">{inv.status}</td>
                      <td className="py-3 pr-4 text-xs">
                        {inv.period_start ? new Date(inv.period_start).toLocaleDateString() : "—"}
                        {inv.period_end ? ` → ${new Date(inv.period_end).toLocaleDateString()}` : ""}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</td>
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
