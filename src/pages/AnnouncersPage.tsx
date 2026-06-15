import { useAnnouncers } from '@/hooks/useAnnouncers'

export function AnnouncersPage() {
  const { data, isLoading, error } = useAnnouncers()

  if (isLoading) {
    return <div>Loading announcers...</div>
  }

  if (error) {
    return <div>Failed to load announcers</div>
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Voks Announcers
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((announcer) => (
          <div
            key={announcer.id}
            className="rounded-xl border p-4 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {announcer.title.rendered}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {announcer.slug}
            </p>

            {announcer.acf?.link_instagram && (
              <a
                href={announcer.acf.link_instagram}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-blue-600"
              >
                Instagram
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}