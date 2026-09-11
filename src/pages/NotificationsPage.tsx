import { useRef } from 'react'
import { X, Bell } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useNotificationContext } from '@/features/notifications/context/useNotificationContext'
import { useNotifications as useWpNotifications } from '@/hooks/useNotifications'

export function NotificationsPage() {
  const { notifications: supabaseNotifs, remove, refresh } = useNotificationContext()
  const { data: wpNotifs = [], isLoading: wpLoading } = useWpNotifications()

  // Broadcast WP → semua user, tampil di kedua tempat (Home stories + /notifications)
  // Merge: Supabase (realtime per-user) + WP broadcast (publik) — sorted terbaru
  const now = Date.now()
  const wpFiltered = wpNotifs.filter((n) => {
    const acf = (n as unknown as { acf?: Record<string, string> }).acf
    if (!acf) return true
    if (acf.expiry_date) {
      const exp = new Date(acf.expiry_date).valueOf()
      if (!Number.isNaN(exp) && exp < now) return false
    }
    if (acf.schedule_send) {
      const sched = new Date(acf.schedule_send).valueOf()
      if (!Number.isNaN(sched) && sched > now) return false
    }
    return true
  })
  const wpVisible = wpFiltered.slice(0, 20)
  const mergedWpAsNotif = wpVisible.map((w) => {
    const raw = w as unknown as { id: number; date?: string; acf?: Record<string, string>; title?: { rendered?: string } }
    return {
      id: `wp-${raw.id}` as unknown as string,
      title: raw.acf?.notification_title ?? raw.title?.rendered ?? "Notification",
      message: raw.acf?.notification_message ?? "",
      category: (raw.acf?.notification_type ?? "promo") as string,
      read: false,
      created_at: raw.date ?? new Date().toISOString(),
      _wpRaw: raw,
    } as unknown as (typeof supabaseNotifs)[number]
  })
  const visibleNotifications = [...supabaseNotifs, ...mergedWpAsNotif].sort(
    (a, b) => new Date((b as unknown as { created_at: string }).created_at).valueOf() - new Date((a as unknown as { created_at: string }).created_at).valueOf(),
  )
  const isLoading = wpLoading && visibleNotifications.length === 0

  function dismissNotification(id: string) {
    // WP items are id `wp-xxx` — not in Supabase, just ignore or filter locally
    if (String(id).startsWith("wp-")) return
    remove(id)
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: visibleNotifications.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 112,
    overscan: 5,
  })

  if (isLoading) {

    return (
      <div className="p-6">
        Loading notifications...
      </div>
    )

  }

  return (
    <>
      <div
        ref={scrollRef}
        className="p-6 pb-24 overflow-auto"
        style={{ maxHeight: '100vh' }}
      >

        <h1 className="mb-6 text-3xl font-bold">
          Notifications
        </h1>

        {visibleNotifications.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow">
            <Bell size={32} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No notifications available</p>
            <p className="mt-1 text-xs text-gray-400">Buat notifikasi di WordPress (Publish + send_now) akan tampil di sini</p>
            <button onClick={() => refresh()} className="mt-4 rounded-full bg-[#bda752] px-4 py-1.5 text-xs font-semibold text-white">Refresh</button>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = visibleNotifications[virtualItem.index] as unknown as Record<string, unknown>
              const title = (item.title as string) ?? "Notification"
              const message = (item.message as string) ?? ""
              const category = (item.category as string) ?? "system"
              const read = Boolean(item.read)
              return (
                <div
                  key={String(item.id)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className={`relative rounded-2xl border p-4 shadow-sm ${read ? "border-gray-100 bg-gray-50" : "border-gray-100 bg-white"}`}>
                    <button
                      onClick={() => dismissNotification(String(item.id))}
                      className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                    <div className="mb-2 flex items-center gap-2 pr-6">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${read ? "bg-gray-100 text-gray-500" : "bg-[#bda752]/12 text-[#bda752]"}`}>
                        {category}
                      </span>
                      {!read && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                    </div>
                    <h2 className="pr-6 text-sm font-semibold leading-tight text-gray-900 line-clamp-2">{title}</h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600 line-clamp-2">{message}</p>
                    <p className="mt-2 text-[11px] text-gray-400">{new Date(item.created_at as string).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="h-3" />
                </div>
              )
            })}
          </div>
        )}

      </div>
    </>
  )
}
