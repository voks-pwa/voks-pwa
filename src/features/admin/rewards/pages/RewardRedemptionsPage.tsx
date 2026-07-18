import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useRewardRedemptions } from "../hooks/useRewardRedemptions";
import { RedemptionSummary } from "../components/RedemptionSummary";
import { RedemptionTable } from "../components/RedemptionTable";

export default function RewardRedemptionsPage() {
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<
    "all" | "pending" | "approved" | "completed" | "rejected"
  >("all");

  const {
    data = [],
    isLoading,
    error,
  } = useRewardRedemptions();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword =
        search.trim().toLowerCase();

      const matchSearch =
        keyword === ""
          ? true
          : (item.reward_name ?? "")
              .toLowerCase()
              .includes(keyword);

      const matchStatus =
        status === "all"
          ? true
          : item.reward_status === status;

      return matchSearch && matchStatus;
    });
  }, [data, search, status]);

  if (isLoading) {
    return (
      <div className="flex h-52 items-center justify-center">
        Loading reward redemptions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Failed to load reward redemptions.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">

      <div>

        <h1 className="text-3xl font-black">
          Reward Redemptions
        </h1>

        <p className="text-gray-500">
          Manage reward redemption requests.
        </p>

      </div>

      <RedemptionSummary
        data={data}
      />

      <div className="flex gap-4">

        <div className="relative flex-1">

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
          className="rounded-2xl border border-gray-200 bg-white px-4"
        >

          <option value="all">
            All
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="rejected">
            Rejected
          </option>

        </select>

      </div>

      <div className="text-sm text-gray-500">

        Showing{" "}

        <strong>

          {filteredData.length}

        </strong>{" "}

        of{" "}

        <strong>

          {data.length}

        </strong>{" "}

        redemptions

      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-3xl bg-white p-16 text-center shadow">
          No reward redemption found.
        </div>
      ) : (
        <RedemptionTable
          redemptions={filteredData}
        />
      )}

    </div>
  );
}