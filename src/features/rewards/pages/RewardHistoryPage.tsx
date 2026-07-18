import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Ban,
  CalendarX,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";

import { useUserRedemptions } from "../hooks/useUserRedemptions";

const STATUS_ICONS: Record<
  string,
  React.ReactNode
> = {
  pending: (
    <Clock
      size={18}
      className="text-orange-500"
    />
  ),
  approved: (
    <CheckCircle2
      size={18}
      className="text-blue-500"
    />
  ),
  completed: (
    <PackageCheck
      size={18}
      className="text-green-500"
    />
  ),
  rejected: (
    <XCircle
      size={18}
      className="text-red-500"
    />
  ),
  cancelled: (
    <Ban
      size={18}
      className="text-gray-500"
    />
  ),
  expired: (
    <CalendarX
      size={18}
      className="text-gray-500"
    />
  ),
  refunded: (
    <Clock
      size={18}
      className="text-purple-500"
    />
  ),
};

const STATUS_COLORS: Record<
  string,
  string
> = {
  pending:
    "bg-orange-100 text-orange-700",
  approved:
    "bg-blue-100 text-blue-700",
  completed:
    "bg-green-100 text-green-700",
  rejected:
    "bg-red-100 text-red-700",
  cancelled:
    "bg-gray-200 text-gray-600",
  expired:
    "bg-gray-200 text-gray-600",
  refunded:
    "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<
  string,
  string
> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
  refunded: "Refunded",
};

const ITEMS_PER_PAGE = 10;

export function RewardHistoryPage() {
  const { user } = useAuth();
  const { data: redemptions = [], isLoading } =
    useUserRedemptions();

  const [search, setSearch] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return redemptions
      .filter((r) => {
        const keyword =
          search.trim().toLowerCase();
        const matchSearch =
          keyword === ""
            ? true
            : r.reward_name
                .toLowerCase()
                .includes(keyword);
        const matchStatus =
          statusFilter === "all"
            ? true
            : r.reward_status ===
              statusFilter;
        return (
          matchSearch && matchStatus
        );
      });
  }, [redemptions, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / ITEMS_PER_PAGE
    )
  );

  const paged = useMemo(() => {
    const start =
      (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filtered, page]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <Gift
          size={48}
          className="mx-auto text-gray-300"
        />

        <h2 className="mt-4 text-xl font-bold">
          Sign in to view your reward
          history
        </h2>

        <Link
          to="/login"
          className="mt-6 inline-block rounded-2xl bg-[#bda752] px-8 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-xl font-black">
            Reward History
          </h1>

          <p className="text-sm text-gray-500">
            {redemptions.length} total
            redemptions
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reward..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            "all",
            "pending",
            "approved",
            "completed",
            "rejected",
            "cancelled",
            "refunded",
            "expired",
          ].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-[#bda752] text-white"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              {s === "all"
                ? "All"
                : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {!isLoading && paged.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <Gift
              size={36}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-gray-500">
              {search ||
              statusFilter !== "all"
                ? "No matching redemptions."
                : "No redemptions yet. Browse the reward store!"}
            </p>

            <Link
              to="/reward-store"
              className="mt-4 inline-block rounded-xl bg-[#bda752] px-6 py-2 font-semibold text-white"
            >
              Browse Rewards
            </Link>
          </div>
        )}

        {!isLoading && paged.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  {STATUS_ICONS[
                    r.reward_status
                  ] ?? null}
                </div>

                <div>
                  <p className="font-bold">
                    {r.reward_name}
                  </p>

                  <p className="mt-0.5 text-sm text-gray-500">
                    {new Date(
                      r.redeemed_at
                    ).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>

                  {r.notes && (
                    <p className="mt-1 text-xs text-gray-400">
                      {r.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="font-black text-[#bda752]">
                  -{r.reward_cost} VXP
                </span>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_COLORS[
                      r.reward_status
                    ]
                  }`}
                >
                  {
                    STATUS_LABELS[
                      r.reward_status
                    ]
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() =>
              setPage(
                Math.max(1, page - 1)
              )
            }
            disabled={page === 1}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() =>
              setPage(
                Math.min(
                  totalPages,
                  page + 1
                )
              )
            }
            disabled={
              page === totalPages
            }
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
