import { useMemo, useState } from "react";
import { useRewardRedemptions } from "../hooks/useRewardRedemptions";
import { RedemptionSummary } from "../components/RedemptionSummary";
import { RedemptionTable } from "../components/RedemptionTable";
import { Search } from "lucide-react";

export function RewardRedemptionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "pending" | "approved" | "completed" | "rejected"
  >("all");

  const { data, isLoading } = useRewardRedemptions();

  const filteredData = useMemo(() => {
    const list = data ?? [];

    return list.filter((item) => {
      const matchSearch = item.reward_name
        ? item.reward_name.toLowerCase().includes(search.toLowerCase())
        : false;

      const matchStatus =
        status === "all" ? true : item.reward_status === status;

      return matchSearch && matchStatus;
    });
  }, [data, search, status]);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm font-medium text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#bda752] border-t-transparent" />
          <span>Loading redemptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-24">
      <h1 className="mb-8 text-3xl font-black tracking-tight text-gray-900">
        Reward Redemptions
      </h1>

      {/* Summary Section */}
      <RedemptionSummary data={data ?? []} />

      {/* Search + Filter Container */}
      <div className="mb-6 mt-6 flex gap-4">
        {/* INPUT DENGAN IKON SEARCH ABSOLUTE */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reward..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#bda752] transition-colors text-sm"
          />
        </div>

        {/* SELECT STATE FILTER */}
        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as
                | "all"
                | "pending"
                | "approved"
                | "completed"
                | "rejected"
            )
          }
          className="rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-[#bda752] text-sm text-gray-700 transition-colors"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* INDIKATOR SHOWING STATS DI BAWAH SEARCH */}
      <div className="mb-5 flex justify-between text-sm text-gray-500 font-medium px-1">
        <span>
          Showing
          <strong className="mx-1 text-gray-800 font-bold">
            {filteredData.length}
          </strong>
          of
          <strong className="mx-1 text-gray-800 font-bold">
            {data?.length ?? 0}
          </strong>
          redemptions
        </span>
      </div>

      {/* KONDISI EMPTY STATE VS REDEMPTION TABLE CONTAINER */}
      {filteredData.length === 0 ? (
        <div className="rounded-3xl bg-white py-24 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="text-5xl animate-bounce duration-1000">🎁</div>
          <h3 className="mt-4 text-xl font-bold text-gray-800">
            No reward redemption found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try another keyword or change your filter status.
          </p>
        </div>
      ) : (
        <RedemptionTable redemptions={filteredData} />
      )}
    </div>
  );
}