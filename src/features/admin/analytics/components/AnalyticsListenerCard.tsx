import { Radio, Headphones, Clock, AlertCircle } from "lucide-react";

interface Props {
  currentListeners: number;
  totalListenedMinutes: number;
  azuracastError: string | null;
}

export function AnalyticsListenerCard({ currentListeners, totalListenedMinutes, azuracastError }: Props) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
        <Radio size={20} className="text-[#bda752]" />
        AzuraCast Live
      </h3>

      {azuracastError ? (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">AzuraCast API unavailable</p>
            <p className="mt-1 text-amber-600">{azuracastError}</p>
            <p className="mt-1 text-xs text-amber-500">Configure AZURACAST_API_URL in Edge Function secrets.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-blue-50 p-4">
            <Headphones size={22} className="text-blue-500" />
            <p className="mt-2 text-xs text-gray-500">Current Listeners</p>
            <p className="text-3xl font-black text-blue-600">
              {(currentListeners ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 p-4">
            <Clock size={22} className="text-green-500" />
            <p className="mt-2 text-xs text-gray-500">Min. Listened</p>
            <p className="text-3xl font-black text-green-600">
              {(totalListenedMinutes ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
