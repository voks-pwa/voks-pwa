import { Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export function UserToolbar({ search, onSearchChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users"
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#bda752]"
        />
      </div>
    </div>
  );
}
