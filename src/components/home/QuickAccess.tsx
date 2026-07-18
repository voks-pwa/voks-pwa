import { Link } from "react-router-dom";
import { Radio, Mic2, Calendar, Gift, Clock } from "lucide-react";
import { isFeatureEnabled } from "@/features/flags";

const links = [
  { to: "/programs", icon: Radio, label: "Programs" },
  { to: "/announcers", icon: Mic2, label: "Hosts" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/reward-store", icon: Gift, label: "Rewards" },
];

export function QuickAccess() {
  const rewardEnabled = isFeatureEnabled("reward");

  return (
    <div className="grid grid-cols-4 gap-3">
      {links.map((link) => {
        const Icon = rewardEnabled || link.to !== "/reward-store" ? link.icon : Clock;
        const isDisabled = !rewardEnabled && link.to === "/reward-store";

        if (isDisabled) {
          return (
            <div
              key={link.to}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                <Icon size={20} />
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {link.label}
              </span>
            </div>
          );
        }

        return (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
              <Icon size={20} />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
