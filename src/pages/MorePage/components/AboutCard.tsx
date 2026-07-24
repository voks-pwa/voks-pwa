import { Layers, Info, CheckCircle } from "lucide-react"

export function AboutCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-[#bda752] to-[#8f7d3a]" />
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">About Voks Radio</p>
      <p className="text-sm leading-relaxed text-gray-500">
        Bandung's Feel Good Radio — delivering music, entertainment, podcasts, visual radio,
        and engaging conversations for modern listeners.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
          <Layers size={12} className="text-gray-400" /> VOKS DIGITAL 2026
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
          <Info size={12} className="text-gray-400" /> v1.0.0
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <CheckCircle size={12} /> Beta
        </span>
      </div>
    </div>
  )
}
