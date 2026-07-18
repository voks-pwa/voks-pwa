import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: Record<string, unknown>) => React.ReactNode;
  className?: string;
}

interface Props {
  columns: Column[];
  data: Record<string, unknown>[];
  keyExtractor: (item: Record<string, unknown>) => string;
  sortKey?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (item: Record<string, unknown>) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  pageSizeOptions?: number[];
}

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown size={14} className="text-gray-300" />;
  return direction === "asc" ? (
    <ChevronUp size={14} className="text-[#bda752]" />
  ) : (
    <ChevronDown size={14} className="text-[#bda752]" />
  );
}

export function AdminDataTable({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortDirection = "asc",
  onSort,
  page,
  pageSize = 10,
  total,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  isLoading,
  emptyMessage = "No data found",
  pageSizeOptions = [10, 25, 50],
}: Props) {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl bg-white shadow">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center rounded-3xl bg-white p-12 shadow">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 text-left text-sm font-semibold text-gray-600 ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-900" : ""
                  } ${col.className ?? ""}`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        active={sortKey === col.key}
                        direction={sortDirection}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`border-t transition ${
                  onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`p-4 ${col.className ?? ""}`}>
                    {col.render ? col.render(item) : String(item[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(onPageChange || onPageSizeChange) && (
        <div className="flex flex-wrap items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {total != null && <span>{total} total</span>}
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border px-2 py-1 text-sm outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}
          </div>

          {onPageChange && (
            <div className="flex items-center gap-1">
              <button
                disabled={!page || page <= 1}
                onClick={() => onPageChange((page ?? 1) - 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="px-2 text-sm text-gray-500">
                {page ?? 1} of {totalPages}
              </span>
              <button
                disabled={!page || page >= totalPages}
                onClick={() => onPageChange((page ?? 1) + 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
