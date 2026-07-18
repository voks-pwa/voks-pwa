import { Megaphone } from "lucide-react";

export function CampaignEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
        <Megaphone size={36} className="text-[#bda752]" />
      </div>
      <h3 className="mt-5 text-lg font-black text-gray-900">
        No campaign available.
      </h3>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        New sponsored events and missions are coming soon. Check back later.
      </p>
    </div>
  );
}
