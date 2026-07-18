import { Link } from "react-router-dom";
import { useActiveRewardAggregate } from "@/features/rewards/hooks/useRewardAggregate";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function RewardPreview() {
  const { data: rewards, isLoading } = useActiveRewardAggregate();

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Rewards" label="Redeem" viewAllLink="/reward-store" />
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </section>
    );
  }

  if (!rewards?.length) return null;

  const sorted = [...rewards]
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.cost - b.cost;
    })
    .slice(0, 3);

  return (
    <section>
      <SectionHeader title="Rewards" label="Redeem" viewAllLink="/reward-store" />
      <div className="mt-5 grid grid-cols-3 gap-4">
        {sorted.map((reward) => (
          <Link
            key={reward.id}
            to="/reward-store"
            className="group overflow-hidden rounded-2xl bg-gray-50 shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#5d5b3d] to-[#bda752]">
              {reward.image_url && (
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-bold">{reward.name}</h3>
              <p className="mt-1 text-xs font-semibold text-[#bda752]">{reward.cost} VXP</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
