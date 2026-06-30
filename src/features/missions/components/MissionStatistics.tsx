import { CheckCircle2, Trophy, Target } from "lucide-react";
import { useMissionStatistics } from "@/hooks/useMissionStatistics";

export function MissionStatistics() {
  const stats = useMissionStatistics();

  const cards = [
    {
      title: "Total Mission",
      value: stats.total,
      icon: Target,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Claimed",
      value: stats.claimed,
      icon: Trophy,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
            >
              <Icon size={20} />
            </div>

            <p className="text-xs text-gray-500">
              {card.title}
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              {card.value}
            </h3>
          </div>
        );
      })}
    </div>
  );
}