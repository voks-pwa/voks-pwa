import { useWalletHistory } from "../hooks/useWallet";
import { useAuth } from "@/features/auth/useAuth";

const TX_LABELS: Record<string, string> = {
  MISSION_REWARD: "Mission Reward",
  ACHIEVEMENT_REWARD: "Achievement",
  CAMPAIGN_REWARD: "Campaign Reward",
  CHECKIN: "Daily Check-in",
  LISTEN: "Listening",
  PROFILE: "Profile Bonus",
  REFERRAL: "Referral",
  SHARE: "Share",
  BONUS: "Bonus",
  PENALTY: "Penalty",
  REDEEM: "Redeemed",
  REFUND: "Refund",
  ADMIN_ADJUSTMENT: "Admin",
  SYSTEM: "System",
};

export function WalletHistory() {
  const { user } = useAuth();
  const { data, isLoading } = useWalletHistory(user?.id ?? null);

  if (!user) return null;
  if (isLoading) return <div className="py-8 text-center text-gray-400">Loading...</div>;

  const entries = data?.data ?? [];

  if (entries.length === 0) {
    return <div className="py-8 text-center text-gray-400">No transactions yet</div>;
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const isCredit = entry.amount > 0;
        const label = TX_LABELS[entry.transaction_type] ?? entry.transaction_type;

        return (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                {entry.description && (
                  <p className="text-xs text-gray-400">{entry.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={`text-sm font-bold ${isCredit ? "text-green-400" : "text-red-400"}`}
            >
              {isCredit ? "+" : ""}{entry.amount.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
