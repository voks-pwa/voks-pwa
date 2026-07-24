import { Globe, Music2, Play, RadioIcon, ExternalLink } from "lucide-react"
import { SectionHeader } from "./SectionHeader"

const links = [
  { href: "https://instagram.com/voksradio", icon: Globe, label: "Instagram", color: "bg-linear-to-br from-yellow-400 via-pink-500 to-purple-600", subtitle: "@voksradio" },
  { href: "https://tiktok.com/@voksradio", icon: Music2, label: "TikTok", color: "bg-gray-900", subtitle: "@voksradio" },
  { href: "https://youtube.com/@voksradio", icon: Play, label: "YouTube", color: "bg-red-600", subtitle: "Voks Radio" },
  { href: "https://voksradio.com", icon: RadioIcon, label: "Website", color: "bg-blue-600", subtitle: "voksradio.com" },
]

export function ConnectSection() {
  return (
    <div className="mb-6">
      <SectionHeader icon={Globe} label="Connect" />
      <div className="grid grid-cols-2 gap-3">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-start gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-[#bda752]/30 active:scale-95"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${link.color} text-white shadow-sm`}>
                <Icon size={20} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">{link.label}</span>
                  <ExternalLink size={12} className="text-gray-300 transition group-hover:text-[#bda752]" />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{link.subtitle}</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
