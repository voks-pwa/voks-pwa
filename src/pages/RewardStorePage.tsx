import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift, AlertCircle, Search, Sparkles, Coins, ArrowUpDown } from "lucide-react";

import { useActiveRewardAggregate } from "@/features/rewards/hooks/useRewardAggregate";

import { RewardCard } from "@/features/rewards/components/RewardCard";
import { RewardDetailSheet } from "@/features/rewards/components/RewardDetailSheet";

import type { RewardAggregate } from "@/features/rewards/types/rewardAggregate";

type SortKey = "priority" | "cost-asc" | "cost-desc" | "name-asc" | "name-desc";

const CATEGORIES = [
  "all",
  "digital",
  "voucher",
  "coupon",
  "physical",
  "merchandise",
  "event",
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  digital: "Digital",
  voucher: "Voucher",
  coupon: "Coupon",
  physical: "Physical",
  merchandise: "Merchandise",
  event: "Event",
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "priority", label: "Featured" },
  { key: "cost-asc", label: "Cost: Low to High" },
  { key: "cost-desc", label: "Cost: High to Low" },
  { key: "name-asc", label: "Name: A-Z" },
  { key: "name-desc", label: "Name: Z-A" },
];

function sortRewards(rewards: RewardAggregate[], sortKey: SortKey): RewardAggregate[] {
  const sorted = [...rewards];
  switch (sortKey) {
    case "priority":
      return sorted.sort((a, b) => a.priority - b.priority);
    case "cost-asc":
      return sorted.sort((a, b) => a.cost - b.cost);
    case "cost-desc":
      return sorted.sort((a, b) => b.cost - a.cost);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

export function RewardStorePage() {
  const { data: rewards = [], isLoading, isError } = useActiveRewardAggregate();

  const [selectedReward, setSelectedReward] =
    useState<RewardAggregate | null>(null);

  const [open, setOpen] =
    useState(false);

  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const featured = useMemo(() => {
    const featuredRewards = rewards.filter((r) => r.featured);
    return featuredRewards.length > 0 ? featuredRewards[0] : rewards[0];
  }, [rewards]);

  const filtered = useMemo(() => {
    let result = rewards;

    if (category !== "all") {
      result = result.filter(
        (r) => r.delivery_type.toLowerCase() === category
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    return sortRewards(result, sortKey);
  }, [rewards, category, searchQuery, sortKey]);

  const handleFeaturedClick = () => {
    if (featured) {
      setSelectedReward(featured);
      setOpen(true);
    }
  };

  return (
    <>

        <div className="mb-6 flex items-center gap-4">

          <Link
            to="/more"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-white
              shadow-sm
            "
          >
            <ArrowLeft size={20} />
          </Link>

          <div>

            <h1 className="text-2xl font-black">
              Reward Store
            </h1>

            <p className="text-sm text-gray-500">
              Redeem your VXP for exclusive rewards
            </p>

          </div>

        </div>

        {/* Featured Reward Hero */}

        {!isLoading && !isError && featured && (
          <div
            onClick={handleFeaturedClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFeaturedClick();
              }
            }}
            className="
              relative
              mb-6
              cursor-pointer
              overflow-hidden
              rounded-3xl
              bg-gradient-to-br
              from-[#5d5b3d]
              via-[#887845]
              to-[#bda752]
              p-6
              text-white
              transition
              active:scale-[0.98]
            "
          >
            <div className="absolute right-4 top-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                <Sparkles size={12} />
                Featured
              </span>
            </div>

            <div className="flex items-center gap-4">

              {featured.image_url && (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                  <img
                    src={featured.image_url}
                    alt={featured.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">

                <h2 className="text-xl font-bold">
                  {featured.name}
                </h2>

                <p className="mt-1 truncate text-sm text-white/80">
                  {featured.subtitle || featured.description}
                </p>

                <div className="mt-3 flex items-center gap-3">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                    <Coins size={14} />
                    {featured.cost} VXP
                  </span>

                  {featured.sponsor && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                      {featured.sponsor}
                    </span>
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

        {/* Search & Sort */}

        {!isLoading && !isError && rewards.length > 0 && (
          <div className="mb-4 flex items-center gap-3">

            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rewards..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  py-2.5
                  pl-10
                  pr-4
                  text-sm
                  shadow-sm
                  outline-none
                  transition
                  focus:border-[#bda752]
                  focus:ring-1
                  focus:ring-[#bda752]
                "
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  shadow-sm
                  transition
                  hover:border-gray-300
                "
              >
                <ArrowUpDown size={16} />
                <span className="hidden sm:inline">Sort</span>
              </button>

              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortKey(opt.key);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          sortKey === opt.key
                            ? "bg-[#bda752]/10 font-bold text-[#bda752]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* Category Filter */}

        {!isLoading && !isError && rewards.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  category === cat
                    ? "bg-[#bda752] text-white"
                    : "bg-white text-gray-600 shadow-sm"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}

        {isLoading && (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {Array.from({ length: 4 }).map((_, i) => (

              <div
                key={i}
                className="
                  h-72
                  animate-pulse
                  rounded-3xl
                  bg-gray-200
                "
              />

            ))}

          </div>

        )}

        {/* Error */}

        {isError && !isLoading && (

          <div
            className="
              rounded-3xl
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-red-300"
            />

            <h3 className="text-lg font-bold">
              Failed to load rewards
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Please check your connection and try again.
            </p>

          </div>

        )}

        {/* Empty */}

        {!isLoading && !isError && filtered.length === 0 && (

          <div
            className="
              rounded-3xl
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >

            <Gift
              size={48}
              className="
                mx-auto
                mb-4
                text-gray-300
              "
            />

            <h3 className="text-lg font-bold">
              {searchQuery
                ? "No rewards match your search"
                : category !== "all"
                ? "No rewards in this category"
                : "No Rewards Available"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {searchQuery
                ? "Try a different search term."
                : category !== "all"
                ? "Try selecting a different category."
                : "Check back later for new rewards."}
            </p>

          </div>

        )}

        {/* Result count */}

        {!isLoading && !isError && filtered.length > 0 && (
          <p className="mb-3 text-xs text-gray-400">
            {filtered.length} reward{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Reward Grid */}

        {!isLoading && !isError && filtered.length > 0 && (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {filtered.map((reward) => (

              <RewardCard
                key={reward.id}
                reward={reward}
                onClick={() => {
                  setSelectedReward(reward);
                  setOpen(true);
                }}
              />

            ))}

          </div>

        )}

      <RewardDetailSheet
        reward={selectedReward}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
