import type { RewardRedemption } from "../adminTypes";

interface Props {
  data: RewardRedemption[];
}

export function RedemptionSummary({
  data,
}: Props) {
  const pending =
    data.filter(
      r => r.reward_status === "pending"
    ).length;

  const approved =
    data.filter(
      r => r.reward_status === "approved"
    ).length;

  const completed =
    data.filter(
      r => r.reward_status === "completed"
    ).length;

  const rejected =
    data.filter(
      r => r.reward_status === "rejected"
    ).length;

  const cards = [
    {
      title: "Pending",
      value: pending,
      color: "text-orange-600",
    },
    {
      title: "Approved",
      value: approved,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: completed,
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: rejected,
      color: "text-red-600",
    },
  ];

  return (
    <div
      className="
        mb-8
        grid
        gap-5
        md:grid-cols-4
      "
    >
      {cards.map(card => (
        <div
          key={card.title}
          className="
            rounded-3xl
            bg-white
            p-6
            shadow-sm
          "
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <h2
            className={`mt-2 text-4xl font-black ${card.color}`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}