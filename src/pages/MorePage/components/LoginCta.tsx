import { Link } from "react-router-dom"

export function LoginCta() {
  return (
    <Link
      to="/login"
      className="group mb-4 flex items-center gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#bda752] to-[#8f7d3a] p-6 text-white shadow-md transition hover:shadow-lg"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm transition group-hover:scale-105">
        🎧
      </div>
      <div>
        <h2 className="text-lg font-bold">Join Voks Community</h2>
        <p className="text-sm text-white/70">Listen, earn VXP, and connect</p>
        <span className="mt-2 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#bda752] shadow-sm transition group-hover:bg-gray-100">
          Login / Register
        </span>
      </div>
    </Link>
  )
}
