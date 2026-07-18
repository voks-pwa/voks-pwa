import type { CampaignStatus } from "../types";

const STATUS_STYLES: Record<
  CampaignStatus,
  { label: string; className: string; dot: string }
> = {
  running: {
    label: "Live",
    className: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  ending_soon: {
    label: "Ending Soon",
    className: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-400",
    dot: "bg-gray-300",
  },
  ended: {
    label: "Ended",
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
  hidden: {
    label: "Hidden",
    className: "bg-gray-100 text-gray-400",
    dot: "bg-gray-300",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-400",
    dot: "bg-gray-300",
  },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: CampaignStatus;
  size?: "sm" | "md";
}) {
  const style = STATUS_STYLES[status];
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
