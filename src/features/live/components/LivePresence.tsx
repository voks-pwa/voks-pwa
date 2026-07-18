import { Eye } from "lucide-react";

interface Props {
  count: number;
}

export function LivePresence({ count }: Props) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      <Eye size={14} />
      <span>{count} watching</span>
    </div>
  );
}
