import { useState } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Ban, Trash2, Coins,
  Hash, MapPin, Phone, Cake, Link,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useUserDetail } from "../hooks/useUser";
import { useUpdateUserRole } from "../hooks/useUserMutations";
import { useProfile } from "@/features/profile/hooks/useProfile";
import type { AdminUser } from "../types";
import { showToast } from "@/components/ui/showToast";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useUserDetail(id);
  const updateRole = useUpdateUserRole();
  const { data: adminProfile } = useProfile();
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  return (
    <div className="space-y-6 p-8">
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Users
      </button>

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
              <h3 className="font-bold">Identity</h3>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-gray-400" />
                <select
                  value={data.profile.role}
                  onChange={(e) => updateRole.mutate({ id: data.profile.id, role: e.target.value as AdminUser['role'] })}
                  className="rounded-lg border px-2 py-1 text-xs font-semibold outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Badge" value={data.profile.badge_name} />
              <Field label="Level" value={`Lv.${data.profile.level}`} />
              <Field label="Current VXP" value={data.profile.current_vxp.toLocaleString()} />
              <Field label="Lifetime VXP" value={data.profile.lifetime_vxp.toLocaleString()} />
              <Field label="Profile Complete" value={data.profile.profile_completed ? "Yes" : "No"} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">Profile</h3>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Phone" value={data.profile.phone_number} icon={<Phone size={12} />} />
              <Field label="Birthday" value={data.profile.birthday} icon={<Cake size={12} />} />
              <Field label="Gender" value={data.profile.gender} />
              <Field label="Province" value={data.profile.province} icon={<MapPin size={12} />} />
              <Field label="City" value={data.profile.city} icon={<MapPin size={12} />} />
              <Field label="Favorite Program" value={data.profile.favorite_program} />
              <Field label="Favorite Music" value={data.profile.favorite_music} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">Social Media</h3>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Instagram" value={data.profile.instagram} />
              <Field label="TikTok" value={data.profile.tiktok} />
              <Field label="YouTube" value={data.profile.youtube} />
              <Field label="Facebook" value={data.profile.facebook} />
              <Field label="Threads" value={data.profile.threads} />
              <Field label="Website" value={data.profile.website} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">Referral</h3>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Referral Code" value={data.profile.referral_code} icon={<Hash size={12} />} />
              <Field label="Referred By" value={data.profile.referred_by ?? "-"} icon={<Link size={12} />} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#F8F8F8] p-5">
              <p className="text-xs text-gray-500">Missions</p>
              <h3 className="mt-2 text-2xl font-black">{data.stats.missionCount.toLocaleString()}</h3>
            </div>
            <div className="rounded-2xl bg-[#F8F8F8] p-5">
              <p className="text-xs text-gray-500">Transactions</p>
              <h3 className="mt-2 text-2xl font-black">{data.stats.transactionCount.toLocaleString()}</h3>
            </div>
            <div className="rounded-2xl bg-[#F8F8F8] p-5">
              <p className="text-xs text-gray-500">Redemptions</p>
              <h3 className="mt-2 text-2xl font-black">{data.stats.redemptionCount.toLocaleString()}</h3>
            </div>
          </div>

          {data.recentTransactions.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold">Recent XP Transactions</h3>
              <div className="space-y-2">
                {data.recentTransactions.slice(0, 10).map((t, i) => (
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

          {/* Admin Actions */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">Admin Actions</h3>
            <div className="flex flex-wrap gap-3">
              {data.profile.role !== "banned" ? (
                <button
                  onClick={async () => {
                    if (!window.confirm("Ban this user?")) return;
                    const { error } = await supabase.functions.invoke("admin-user-actions", {
                      body: { action: "ban", userId: data.profile.id, actorId: adminProfile?.id },
                    });
                    if (error) { showToast({ type: "error", title: "Ban failed", message: error.message }); return; }
                    showToast({ type: "success", title: "User banned" });
                    refetch();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition"
                >
                  <Ban size={16} /> Ban
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const { error } = await supabase.functions.invoke("admin-user-actions", {
                      body: { action: "unban", userId: data.profile.id, actorId: adminProfile?.id },
                    });
                    if (error) { showToast({ type: "error", title: "Unban failed", message: error.message }); return; }
                    showToast({ type: "success", title: "User unbanned" });
                    refetch();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-100 transition"
                >
                  <Ban size={16} /> Unban
                </button>
              )}

              <button
                onClick={async () => {
                  if (!window.confirm("Delete this user? This will anonymize their profile.")) return;
                  const { error } = await supabase.functions.invoke("admin-user-actions", {
                    body: { action: "delete", userId: data.profile.id, actorId: adminProfile?.id },
                  });
                  if (error) { showToast({ type: "error", title: "Delete failed", message: error.message }); return; }
                  showToast({ type: "success", title: "User deleted" });
                  navigate("/admin/users");
                }}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>

            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 text-sm font-bold text-gray-600">Adjust VXP</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-gray-400">Amount</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="+100 or -50"
                    className="mt-1 w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#bda752]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Reason</label>
                  <input
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Reason for adjustment"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#bda752]"
                  />
                </div>
                <button
                  onClick={async () => {
                    const amount = parseInt(adjustAmount);
                    if (isNaN(amount) || amount === 0) { showToast({ type: "error", title: "Invalid amount" }); return; }
                    const { error } = await supabase.functions.invoke("admin-user-actions", {
                      body: { action: "adjust_vxp", userId: data.profile.id, amount, reason: adjustReason || "Admin adjustment", actorId: adminProfile?.id },
                    });
                    if (error) { showToast({ type: "error", title: "Adjustment failed", message: error.message }); return; }
                    showToast({ type: "success", title: `VXP adjusted by ${amount}` });
                    setAdjustAmount("");
                    setAdjustReason("");
                    refetch();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#bda752] px-4 py-2 text-sm font-bold text-white hover:bg-[#a69243] transition"
                >
                  <Coins size={16} /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !data && (
        <div className="py-20 text-center">
          <p className="text-gray-500">User not found.</p>
          {error && (
            <p className="mt-2 text-xs text-red-400">Error: {error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-400">
        {icon}{label}
      </p>
      <p className="mt-1 font-semibold">{value ?? "-"}</p>
    </div>
  );
}
