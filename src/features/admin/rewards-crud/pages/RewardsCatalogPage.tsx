import { useCallback, useMemo, useState } from "react";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useAdminRewardCatalog, useSyncRewardsFromWP, useAdjustRewardStock, adminRewardKeys } from "../hooks/useAdminRewardCatalog";
import { useUpdateReward } from "../hooks/useAdminRewards";
import { updateRewardOperational } from "@/features/rewards/repositories/rewardSyncRepository";
import { RewardTable } from "../components/RewardTable";
import { RewardEditDialog } from "../components/RewardEditDialog";

import type { RewardAggregate } from "@/features/rewards/types/rewardAggregate";
import type { RewardEditData } from "../components/RewardEditDialog";

function normalizeRow(
  row: RewardAggregate
): RewardEditData {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    cost: row.cost,
    stock: row.stock,
    active: row.reward_active,
    featured: row.featured,
    priority: row.priority,
    status: row.reward_active ? "Available" : "Inactive",
  };
}

interface RewardRowItem {
  id: number;
  title: string;
  subtitle: string;
  cost: number;
  stock: number;
  active: boolean;
  featured: boolean;
  priority: number;
  status: string;
}

export function RewardsCatalogPage() {
  const [search, setSearch] = useState("");

  const [editReward, setEditReward] =
    useState<RewardEditData | null>(null);

  const queryClient = useQueryClient();

  const {
    data: localRewards = [],
    isLoading: catalogLoading,
  } = useAdminRewardCatalog();

  const syncMutation = useSyncRewardsFromWP();
  const updateMutation = useUpdateReward();
  const adjustStockMutation = useAdjustRewardStock();

  const rows: RewardRowItem[] =
    useMemo(() => {
      return localRewards
        .map((row) => ({
          id: row.id,
          title: row.name,
          subtitle: row.subtitle ?? "",
          cost: row.cost,
          stock: row.stock,
          active: row.reward_active,
          featured: row.featured,
          priority: row.priority,
          status: row.reward_active ? "Available" : "Inactive",
        }))
        .filter(
          (reward) =>
            reward.title
              .toLowerCase()
              .includes(search.toLowerCase())
        )
        .sort((a, b) =>
          (a.cost ?? 0) - (b.cost ?? 0)
        );
    }, [localRewards, search]);

  const handleEdit = useCallback(
    (rewardId: number) => {
      const reward = normalizeRow(
        localRewards.find(
          (r) => r.id === rewardId
        )!
      );

      setEditReward(reward);
    },
    [localRewards]
  );

  const handleSave = useCallback(
    async (data: RewardEditData) => {
      await updateMutation.mutateAsync({
        rewardId: data.id,
        name: data.name,
        subtitle: data.subtitle,
        description: data.description,
        cost: data.cost,
        stock: data.stock,
        active: data.active,
        featured: data.featured,
        status: data.status,
      });

      await updateRewardOperational(data.id, {
        cost: data.cost,
        reward_active: data.active,
        featured: data.featured,
        priority: data.priority,
      });

      if (data.stock !== 0) {
        await adjustStockMutation.mutateAsync({
          rewardId: data.id,
          newStock: data.stock,
          reason: "Admin edit",
        });
      }

      queryClient.invalidateQueries({ queryKey: adminRewardKeys.all });
      setEditReward(null);
    },
    [updateMutation, adjustStockMutation, queryClient]
  );

  if (catalogLoading) {
    return (
      <div className="flex h-52 items-center justify-center">
        Loading rewards...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">
            Reward Catalog
          </h1>
          <p className="text-gray-500">
            Manage reward definitions.
          </p>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-[#bda752] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a8913f] disabled:opacity-50"
        >
          {syncMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          {syncMutation.isPending ? "Syncing..." : "Sync from WP"}
        </button>
      </div>

      {syncMutation.data && (
        <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          Synced: {syncMutation.data.catalog} rewards, {syncMutation.data.inventory} inventory items
        </div>
      )}

      {syncMutation.isError && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Sync failed. Please try again.
        </div>
      )}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search reward..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4"
        />
      </div>

      <RewardTable
        rewards={rows}
        onEdit={handleEdit}
      />

      <RewardEditDialog
        open={editReward !== null}
        reward={editReward}
        saving={updateMutation.isPending}
        onSave={handleSave}
        onClose={() => setEditReward(null)}
      />
    </div>
  );
}
