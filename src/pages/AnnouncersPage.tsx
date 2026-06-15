import { useAnnouncers } from '@/hooks/useAnnouncers'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { Link } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'

export function AnnouncersPage() {
  const { data, isLoading, error } = useAnnouncers()

  if (isLoading) {
    return <div>Loading announcers...</div>
  }

  if (error) {
    return <div>Failed to load announcers</div>
  }

  return (
  <>
    <div className="p-6 pb-24">
      <h1 className="mb-6 text-3xl font-bold">
        Voks Announcers
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((announcer) => {
          const image =
            announcer._embedded?.['wp:featuredmedia']?.[0]
              ?.media_details?.sizes?.medium_large?.source_url ??
            announcer._embedded?.['wp:featuredmedia']?.[0]
              ?.source_url

          return (
            <div
              key={announcer.id}
              className="overflow-hidden rounded-3xl bg-white shadow"
            >
              <Link
                to={`/announcers/${announcer.slug}`}
              >
                {image && (
                  <img
                    src={image}
                    alt={announcer.title.rendered}
                    className="aspect-[4/5] w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold">
                    {announcer.title.rendered}
                  </h2>
                </div>
              </Link>

              {announcer.acf?.link_instagram && (
                <div className="px-5 pb-5">
                  <a
  href={announcer.acf.link_instagram}
  target="_blank"
  rel="noreferrer"
  onClick={(e) => e.stopPropagation()}
  className="mt-3 inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-2 text-pink-600 hover:bg-pink-100"
>
  <FaInstagram />
  Instagram
</a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>

    <BottomNavigation />
  </>
  )
}