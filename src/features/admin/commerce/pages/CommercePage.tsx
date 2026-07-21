import { useState } from "react";
import { Package, Undo2, BarChart3 } from "lucide-react";
import { useAdminFulfillments, useAdminRefunds, useAdminCommerceAnalytics, useAdminUpdateFulfillment, useAdminProcessRefund } from "../hooks/useAdminCommerce";

const TABS = [
  { key: "fulfillment", label: "Fulfillment", icon: Package },
  { key: "refunds", label: "Refunds", icon: Undo2 },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

const FULFILLMENT_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-100",
  PROCESSING: "text-blue-600 bg-blue-100",
  SHIPPED: "text-purple-600 bg-purple-100",
  DELIVERED: "text-green-600 bg-green-100",
  COMPLETED: "text-gray-600 bg-gray-100",
  CANCELLED: "text-red-600 bg-red-100",
};

const REFUND_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-100",
  APPROVED: "text-blue-600 bg-blue-100",
  REJECTED: "text-red-600 bg-red-100",
  COMPLETED: "text-green-600 bg-green-100",
};

export default function CommercePage() {
  const [activeTab, setActiveTab] = useState("fulfillment");
  const [editingFulfillment, setEditingFulfillment] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { status: string; tracking: string; carrier: string }>>({});

  const { data: fulfillments, isLoading: fLoading } = useAdminFulfillments();
  const { data: refunds, isLoading: rLoading } = useAdminRefunds();
  const { data: analytics, isLoading: aLoading } = useAdminCommerceAnalytics(30);

  const updateFulfillment = useAdminUpdateFulfillment();
  const processRefund = useAdminProcessRefund();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Commerce</h1>

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

      {activeTab === "fulfillment" && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Fulfillment Queue</h2>
            {fLoading ? (
              <div>Loading...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="pb-2 pr-4">Order</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Tracking</th>
                    <th className="pb-2 pr-4">Carrier</th>
                    <th className="pb-2 pr-4">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fulfillments || fulfillments.length === 0) ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No fulfillments yet</td></tr>
                  ) : (
                    fulfillments.map((f) => (
                      <tr key={f.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{f.order_id.slice(0, 8)}...</td>
                        <td className="py-3 pr-4">
                          {editingFulfillment === f.id ? (
                            <select
                              value={editValues[f.id]?.status ?? f.status}
                              onChange={(e) => setEditValues((v) => ({ ...v, [f.id]: { ...v[f.id] ?? { status: f.status, tracking: f.tracking_number, carrier: f.carrier }, status: e.target.value } }))}
                              className="rounded-lg border px-2 py-1 text-xs"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          ) : (
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${FULFILLMENT_COLORS[f.status] ?? ""}`}>
                              {f.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {editingFulfillment === f.id ? (
                            <input
                              type="text"
                              value={editValues[f.id]?.tracking ?? f.tracking_number}
                              onChange={(e) => setEditValues((v) => ({ ...v, [f.id]: { ...v[f.id] ?? { status: f.status, tracking: f.tracking_number, carrier: f.carrier }, tracking: e.target.value } }))}
                              className="w-28 rounded-lg border px-2 py-1 text-xs"
                              placeholder="Tracking #"
                            />
                          ) : (
                            <span className="text-xs">{f.tracking_number || "—"}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {editingFulfillment === f.id ? (
                            <input
                              type="text"
                              value={editValues[f.id]?.carrier ?? f.carrier}
                              onChange={(e) => setEditValues((v) => ({ ...v, [f.id]: { ...v[f.id] ?? { status: f.status, tracking: f.tracking_number, carrier: f.carrier }, carrier: e.target.value } }))}
                              className="w-24 rounded-lg border px-2 py-1 text-xs"
                              placeholder="Carrier"
                            />
                          ) : (
                            <span className="text-xs">{f.carrier || "—"}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500">{new Date(f.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          {editingFulfillment === f.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const vals = editValues[f.id];
                                  if (vals) {
                                    updateFulfillment.mutate({
                                      fulfillmentId: f.id,
                                      status: vals.status,
                                      trackingNumber: vals.tracking,
                                      carrier: vals.carrier,
                                    });
                                  }
                                  setEditingFulfillment(null);
                                }}
                                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFulfillment(null)}
                                className="rounded-lg bg-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingFulfillment(f.id)}
                              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium hover:bg-gray-200"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "refunds" && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Refund Requests</h2>
            {rLoading ? (
              <div>Loading...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="pb-2 pr-4">Order</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Reason</th>
                    <th className="pb-2 pr-4">Method</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!refunds || refunds.length === 0) ? (
                    <tr><td colSpan={7} className="py-8 text-center text-gray-400">No refund requests</td></tr>
                  ) : (
                    refunds.map((ref) => (
                      <tr key={ref.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{ref.order_id.slice(0, 8)}...</td>
                        <td className="py-3 pr-4 font-medium">{ref.amount.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-xs text-gray-600">{ref.reason || "—"}</td>
                        <td className="py-3 pr-4 text-xs">{ref.refund_method}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${REFUND_COLORS[ref.status] ?? ""}`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500">{new Date(ref.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          {ref.status === "PENDING" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (confirm("Approve and process this refund?")) {
                                    processRefund.mutate({
                                      refundId: ref.id,
                                      status: "COMPLETED",
                                    });
                                  }
                                }}
                                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Reject this refund?")) {
                                    processRefund.mutate({
                                      refundId: ref.id,
                                      status: "REJECTED",
                                    });
                                  }
                                }}
                                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {ref.status !== "PENDING" && (
                            <span className="text-xs text-gray-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4">
          {aLoading ? (
            <div>Loading...</div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-5 gap-4">
                <div className="rounded-2xl border bg-white p-5">
                  <p className="text-xs uppercase text-gray-500">Revenue (30d)</p>
                  <p className="mt-1 text-2xl font-black">{analytics.revenue.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                  <p className="text-xs uppercase text-gray-500">Orders</p>
                  <p className="mt-1 text-2xl font-black">{analytics.total_orders}</p>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                  <p className="text-xs uppercase text-gray-500">Fulfillments</p>
                  <p className="mt-1 text-2xl font-black">{analytics.fulfillments}</p>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                  <p className="text-xs uppercase text-gray-500">Refunds</p>
                  <p className="mt-1 text-2xl font-black">{analytics.refunds}</p>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                  <p className="text-xs uppercase text-gray-500">Refund Amount</p>
                  <p className="mt-1 text-2xl font-black">{analytics.refund_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-6">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">Top Products</h3>
                  {analytics.top_products.length === 0 ? (
                    <p className="text-sm text-gray-400">No data yet</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-gray-500">
                          <th className="pb-2 pr-4">Product</th>
                          <th className="pb-2 pr-4">Qty Sold</th>
                          <th className="pb-2">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.top_products.map((p, i) => (
                          <tr key={p.product_id} className="border-b last:border-0">
                            <td className="py-2 pr-4 text-xs">{i + 1}. {p.product_name}</td>
                            <td className="py-2 pr-4">{p.total_qty}</td>
                            <td className="py-2">{p.total_revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="rounded-2xl border bg-white p-6">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">Daily Events</h3>
                  {analytics.daily_events.length === 0 ? (
                    <p className="text-sm text-gray-400">No data yet</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-gray-500">
                          <th className="pb-2 pr-4">Day</th>
                          <th className="pb-2 pr-4">Event</th>
                          <th className="pb-2">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.daily_events.map((e, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 pr-4 text-xs">{e.day}</td>
                            <td className="py-2 pr-4 text-xs">{e.event_type}</td>
                            <td className="py-2">{e.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border bg-white p-6 text-center text-gray-400">
              Failed to load analytics
            </div>
          )}
        </div>
      )}
    </div>
  );
}
