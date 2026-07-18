import { X, Shield } from "lucide-react";

import { useUserDetail } from "../hooks/useUser";



interface Props {
  open: boolean;
  userId?: string;
  onClose: () => void;
  onRoleChange?: (id: string, role: string) => void;
}

export function UserDetailDrawer({
  open,
  userId,
  onClose,
  onRoleChange,
}: Props) {
  const { data, isLoading } = useUserDetail(userId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-140 overflow-y-auto bg-[#F5F5F5] p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-black">User Detail</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-200">
            <X size={22} />
          </button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-3xl bg-gray-200" />
            <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
            <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
          </div>
        )}

        {!isLoading && data?.profile && (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <img
                src={
                  data.profile.avatar_url ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(data.profile.display_name ?? "User")}&background=bda752&color=fff&size=80`
                }
                className="h-20 w-20 rounded-full border-2 border-[#bda752] object-cover"
              />
              <div>
                <h2 className="text-2xl font-black">
                  {data.profile.display_name ?? "Unknown"}
                </h2>
                <p className="text-gray-500">{data.profile.email}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Joined {new Date(data.profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Profile</h3>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-gray-400" />
                  {onRoleChange ? (
                    <select
                      value={data.profile.role}
                      onChange={(e) => onRoleChange(data.profile.id, e.target.value)}
                      className="rounded-lg border px-2 py-1 text-xs font-semibold outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  ) : (
                    <span className="text-sm font-semibold capitalize">{data.profile.role}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Badge</p>
                  <p className="mt-1 font-semibold">{data.profile.badge_name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Level</p>
                  <p className="mt-1 font-semibold">Lv.{data.profile.level}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Current VXP</p>
                  <p className="mt-1 font-semibold">{data.profile.current_vxp.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Lifetime VXP</p>
                  <p className="mt-1 font-semibold">{data.profile.lifetime_vxp.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
                  <p className="mt-1 font-semibold">{data.profile.city ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Gender</p>
                  <p className="mt-1 font-semibold">{data.profile.gender ?? "-"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard title="Missions" value={data.stats.missionCount} />
              <StatCard title="Transactions" value={data.stats.transactionCount} />
              <StatCard title="Redemptions" value={data.stats.redemptionCount} />
            </div>

            {data.recentTransactions.length > 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold">Recent XP Transactions</h3>
                <div className="space-y-2">
                  {data.recentTransactions.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-2 text-sm">
                      <div>
                        <span className="font-medium">{t.reason || t.transaction_type}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`font-mono font-bold ${t.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {t.amount >= 0 ? "+" : ""}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && !data && (
          <div className="py-20 text-center text-gray-500">User not found.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#F8F8F8] p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <h3 className="mt-2 text-2xl font-black">{value.toLocaleString()}</h3>
    </div>
  );
}
