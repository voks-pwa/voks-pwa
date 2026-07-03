import { useAuth } from '@/features/auth/useAuth'
import { MissionWidget } from '@/features/missions/components/MissionWidget'

export default function DeveloperMissionSandbox() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white shadow">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <h1 className="text-3xl font-bold">Mission Control Center</h1>
          <p className="text-slate-300">Mission tooling is now surfaced through the main mission UI.</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-slate-600">
            Signed in as <span className="font-semibold">{user.id}</span>.
          </p>
          <MissionWidget />
        </div>
      </div>
    </div>
  )
}