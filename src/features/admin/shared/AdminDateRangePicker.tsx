import { useState } from "react";
import { Calendar } from "lucide-react";

interface Props {
  value: { from: string; to: string } | null;
  onChange: (range: { from: string; to: string } | null) => void;
}

export function AdminDateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition hover:border-[#bda752]"
      >
        <Calendar size={16} className="text-gray-400" />
        {value ? (
          <span>
            {value.from} — {value.to}
          </span>
        ) : (
          <span className="text-gray-400">Date range</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 rounded-2xl border bg-white p-4 shadow-xl">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">From</label>
              <input
                type="date"
                value={value?.from ?? ""}
                onChange={(e) =>
                  onChange({ from: e.target.value, to: value?.to ?? "" })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#bda752]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">To</label>
              <input
                type="date"
                value={value?.to ?? ""}
                onChange={(e) =>
                  onChange({ from: value?.from ?? "", to: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#bda752]"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#bda752] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#a8933e]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
