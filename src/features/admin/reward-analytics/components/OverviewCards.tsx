import { Gift, TrendingUp, PackageCheck, TicketCheck, Truck } from "lucide-react";

interface OverviewCardsProps {
  totalRedeems: number;
  totalBurnedVxp: number;
  inventoryCount: number;
  voucherUsagePct: number;
  pendingShipment: number;
}

const cardClass = "rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition hover:shadow-md";

export function OverviewCards({
  totalRedeems,
  totalBurnedVxp,
  inventoryCount,
  voucherUsagePct,
  pendingShipment,
}: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Gift size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Redeems</p>
            <p className="text-2xl font-bold">{totalRedeems.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Burned VXP</p>
            <p className="text-2xl font-bold">{totalBurnedVxp.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inventory Items</p>
            <p className="text-2xl font-bold">{inventoryCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <TicketCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Voucher Usage</p>
            <p className="text-2xl font-bold">{voucherUsagePct}%</p>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Shipment</p>
            <p className="text-2xl font-bold">{pendingShipment.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
