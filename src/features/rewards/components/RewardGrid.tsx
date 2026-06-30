import { useRewards } from "@/hooks/useRewards";
import { RewardCard } from "./RewardCard";

export function RewardGrid() {
  const {
    data = [],
    isLoading,
  } = useRewards();

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        Loading rewards...
      </div>
    );
  }

  return (
    <div
      className="
      grid
      gap-6
      md:grid-cols-2
    "
    >
      {data.map((reward) => (
        <RewardCard key={reward.id}
          reward={reward}
          onClick={() => {}}
        />
      ))}
    </div>
  );
}