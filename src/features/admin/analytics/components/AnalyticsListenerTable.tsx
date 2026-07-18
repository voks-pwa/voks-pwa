import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Headphones } from "lucide-react";

import type { AzuraCastData } from "../types/analytics";

interface AnalyticsListenerTableProps {
  azuracast: AzuraCastData | null;
  isLoading: boolean;
}

function detectDevice(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("mobile") || u.includes("android") || u.includes("iphone")) return "Mobile";
  if (u.includes("tablet") || u.includes("ipad")) return "Tablet";
  return "Desktop";
}

function detectBrowser(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("chrome") && !u.includes("edg")) return "Chrome";
  if (u.includes("firefox")) return "Firefox";
  if (u.includes("safari") && !u.includes("chrome")) return "Safari";
  if (u.includes("edge")) return "Edge";
  return "Other";
}

function detectPlatform(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("android")) return "Android";
  if (u.includes("iphone") || u.includes("ipad") || u.includes("ios")) return "iOS";
  if (u.includes("windows")) return "Windows";
  if (u.includes("mac")) return "macOS";
  if (u.includes("linux")) return "Linux";
  return "Other";
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatConnectedAt(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch {
    return dateStr;
  }
}

type SortField = "ip" | "connectedSeconds" | "connectedAt";
type SortDir = "asc" | "desc";

export function AnalyticsListenerTable({ azuracast, isLoading }: AnalyticsListenerTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("connectedSeconds");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    if (!azuracast?.listeners) return [];
    const q = search.toLowerCase();
    const items = azuracast.listeners.filter((l) => {
      if (!q) return true;
      return (
        l.ip.toLowerCase().includes(q) ||
        l.userAgent.toLowerCase().includes(q)
      );
    });

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "ip") cmp = a.ip.localeCompare(b.ip);
      else if (sortField === "connectedSeconds") cmp = a.connectedSeconds - b.connectedSeconds;
      else if (sortField === "connectedAt") cmp = a.connectedAt.localeCompare(b.connectedAt);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [azuracast, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Headphones size={20} className="text-[#bda752]" />
          Active Listeners
        </h3>
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!azuracast?.listeners?.length) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Headphones size={20} className="text-[#bda752]" />
          Active Listeners
        </h3>
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
          <Headphones size={18} className="shrink-0" />
          <span>No active listeners</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center justify-between gap-2 text-lg font-black">
        <span className="flex items-center gap-2">
          <Headphones size={20} className="text-[#bda752]" />
          Active Listeners
        </span>
        <span className="text-sm font-semibold text-gray-400">
          {azuracast.uniqueCount} total
        </span>
      </h3>

      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by IP or User-Agent..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#bda752] focus:bg-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
              <th className="pb-2 pr-4">
                <button onClick={() => toggleSort("ip")} className="flex items-center gap-1 transition hover:text-gray-600">
                  IP <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="pb-2 pr-4">Device</th>
              <th className="pb-2 pr-4">Browser</th>
              <th className="pb-2 pr-4">Platform</th>
              <th className="pb-2 pr-4">
                <button onClick={() => toggleSort("connectedSeconds")} className="flex items-center gap-1 transition hover:text-gray-600">
                  Duration <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="pb-2">
                <button onClick={() => toggleSort("connectedAt")} className="flex items-center gap-1 transition hover:text-gray-600">
                  Connected <ArrowUpDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((l, i) => (
              <tr key={i} className="border-b border-gray-50 transition hover:bg-gray-50/50">
                <td className="py-3 pr-4 font-mono text-xs text-gray-700">{l.ip}</td>
                <td className="py-3 pr-4 text-gray-600">{detectDevice(l.userAgent)}</td>
                <td className="py-3 pr-4 text-gray-600">{detectBrowser(l.userAgent)}</td>
                <td className="py-3 pr-4 text-gray-600">{detectPlatform(l.userAgent)}</td>
                <td className="py-3 pr-4 font-medium text-gray-800">{formatDuration(l.connectedSeconds)}</td>
                <td className="py-3 text-xs text-gray-500">{formatConnectedAt(l.connectedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{filtered.length} listener{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg px-3 py-1 font-medium transition hover:bg-gray-100 disabled:opacity-30"
            >
              Prev
            </button>
            <span className="px-2 py-1">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg px-3 py-1 font-medium transition hover:bg-gray-100 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
