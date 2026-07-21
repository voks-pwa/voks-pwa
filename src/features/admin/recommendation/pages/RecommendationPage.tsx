import { usePopularMissions, usePopularRewards } from "@/features/recommendation";
import { Trophy, Medal, TrendingUp } from "lucide-react";

export default function RecommendationPage() {
  const { data: popularMissions, isLoading: mLoading } = usePopularMissions(10);
  const { data: popularRewards, isLoading: rLoading } = usePopularRewards(10);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">AI & Recommendation</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold">Popular Missions</h2>
          </div>

          {mLoading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : !popularMissions || popularMissions.length === 0 ? (
            <div className="text-sm text-gray-400">No mission data yet</div>
          ) : (
            <div className="space-y-3">
              {popularMissions.map((m, i) => (
                <div key={m.mission_id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    {i < 3 ? (
                      <Medal size={18} className={["text-yellow-500", "text-gray-400", "text-amber-700"][i]} />
                    ) : (
                      <span className="w-5 text-center text-sm text-gray-400">{i + 1}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      {m.vxp && <p className="text-xs text-gray-500">{m.vxp} VXP</p>}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{m.completion_count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold">Popular Rewards</h2>
          </div>

          {rLoading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : !popularRewards || popularRewards.length === 0 ? (
            <div className="text-sm text-gray-400">No reward data yet</div>
          ) : (
            <div className="space-y-3">
              {popularRewards.map((r, i) => (
                <div key={r.reward_id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    {i < 3 ? (
                      <Medal size={18} className={["text-yellow-500", "text-gray-400", "text-amber-700"][i]} />
                    ) : (
                      <span className="w-5 text-center text-sm text-gray-400">{i + 1}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.cost} VXP</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{r.redeem_count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-purple-600" />
          <h2 className="text-lg font-bold">Recommendation Engine</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-purple-50 p-4">
            <p className="text-xs font-semibold uppercase text-purple-600">Method</p>
            <p className="mt-1 font-medium">Collaborative Filtering</p>
            <p className="mt-1 text-xs text-gray-500">"Users who completed the same missions"</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase text-blue-600">Data Source</p>
            <p className="mt-1 font-medium">missions_progress + reward_redemptions</p>
            <p className="mt-1 text-xs text-gray-500">Enriched with WordPress content titles</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase text-green-600">Scope</p>
            <p className="mt-1 font-medium">Popular + Personalized</p>
            <p className="mt-1 text-xs text-gray-500">Missions, Rewards (read-only, no wallet)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
