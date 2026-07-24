import { Link } from "react-router-dom"
import { Radio, Calendar, Mic2, Podcast, Compass, ChevronRight } from "lucide-react"
import { SectionHeader } from "./SectionHeader"

const links = [
  { to: "/programs", icon: Radio, label: "Programs", color: "bg-indigo-500" },
  { to: "/schedule", icon: Calendar, label: "Schedule", color: "bg-orange-500" },
  { to: "/announcers", icon: Mic2, label: "Hosts", color: "bg-cyan-500" },
  { to: "/plus", icon: Podcast, label: "Voks+", color: "bg-pink-500" },
]

export function ExploreSection() {
  return (
    <div className="mb-6">
      <SectionHeader icon={Compass} label="Explore" />
      <div className="grid grid-cols-2 gap-3">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group flex flex-col items-start gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-[#bda752]/30 active:scale-95"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${link.color} text-white shadow-sm`}>
                <Icon size={20} />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-bold text-gray-800">{link.label}</span>
                <ChevronRight size={14} className="text-gray-300 transition group-hover:text-[#bda752] group-hover:translate-x-0.5" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
