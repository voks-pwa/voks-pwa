import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
}

export function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <div
      className={`rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <Icon size={24} className="opacity-80" />
        <span className="text-3xl font-black">
          {(value ?? 0).toLocaleString()}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold opacity-90">
        {title}
      </p>
    </div>
  );
}
