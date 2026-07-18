import type { RecentActivityItem } from "../types/dashboard";
import { Star } from "lucide-react";

interface Props {
  activities: RecentActivityItem[];
}

export default function RecentActivity({
  activities,
}: Props) {
  return (
    <div className="rounded-3xl bg-white shadow-lg overflow-hidden">

      <div className="border-b px-6 py-5">

        <h2 className="text-xl font-black">
          Recent Activity
        </h2>

        <p className="text-sm text-gray-500">
          Aktivitas VXP terbaru
        </p>

      </div>

      <div>

        {activities.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Belum ada aktivitas.
          </div>
        )}

        {activities.map((activity) => (

          <div
            key={activity.id}
            className="flex items-center gap-4 border-b last:border-0 px-6 py-5 hover:bg-gray-50 transition-colors"
          >

            <img
              src={
                activity.avatar_url ??
                "https://placehold.co/100"
              }
              className="h-12 w-12 rounded-full object-cover"
            />

            <div className="flex-1">

              <h3 className="font-bold">
                {activity.display_name ??
                  "Unknown User"}
              </h3>

              <p className="text-sm text-gray-500">
                {activity.reason}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {new Date(
                  activity.created_at
                ).toLocaleString()}
              </p>

            </div>

            <div className="text-right">

              <div className="flex items-center justify-end gap-2">

                <Star
                  size={18}
                  className="text-yellow-500"
                />

                <span className="text-xl font-black text-[#bda752]">
                  +{activity.amount}
                </span>

              </div>

              <p className="mt-1 text-xs uppercase text-gray-400">
                {activity.transaction_type}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}