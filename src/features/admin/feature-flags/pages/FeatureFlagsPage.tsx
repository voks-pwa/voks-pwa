import { useFeatureFlags, useUpdateFeatureFlag } from "@/features/operations";
import { ToggleLeft, ToggleRight } from "lucide-react";

export default function FeatureFlagsPage() {
  const { data: flags, isLoading } = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();

  const handleToggle = (key: string, current: boolean) => {
    updateFlag.mutate({ key, enabled: !current });
  };

  const getDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      mission: "Public mission feature — allow users to view and complete missions",
      reward: "Public reward store — allow users to browse and redeem rewards",
      admin: "Admin panel access — grant access to the admin panel",
      campaign: "Campaign feature — show campaigns and sponsored missions",
      leaderboard: "Leaderboard — show user rankings by XP",
      notification: "Notification system — deliver in-app and push notifications",
      wallet: "Wallet feature — allow users to view VXP balance and history",
    };
    return descriptions[key] ?? "";
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Feature Flags</h1>

      <div className="rounded-2xl border bg-white">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-400">Loading...</div>
        ) : !flags || flags.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">No feature flags found</div>
        ) : (
          <div className="divide-y">
            {flags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">{flag.key.replace(/_/g, " ")}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      flag.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {flag.enabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{getDescription(flag.key)}</p>
                </div>
                <button
                  onClick={() => handleToggle(flag.key, flag.enabled)}
                  disabled={updateFlag.isPending}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    flag.enabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {flag.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {flag.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
