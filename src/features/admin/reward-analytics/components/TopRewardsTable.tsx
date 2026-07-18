import type { TopRewardRow } from "../types";

interface TopRewardsTableProps {
  rows: TopRewardRow[];
}

export function TopRewardsTable({ rows }: TopRewardsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6 text-center text-gray-400">
        No reward data yet
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Redeemed Rewards</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="pb-3 font-medium">Reward</th>
              <th className="pb-3 font-medium">Redeems</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className="border-b border-gray-50 last:border-0">
                <td className="flex items-center gap-3 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-700">{row.name}</span>
                </td>
                <td className="py-3 font-semibold">{row.redeems}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
