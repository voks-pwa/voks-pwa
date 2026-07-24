import type { LucideIcon } from "lucide-react"

export function SectionHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <div className="h-5 w-1 rounded-full bg-[#bda752]" />
      {Icon && <Icon size={16} className="text-[#bda752]" />}
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
    </div>
  )
}
