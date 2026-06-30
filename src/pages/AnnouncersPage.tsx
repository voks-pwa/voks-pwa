import { useAnnouncers } from '@/hooks/useAnnouncers'
import { Link } from 'react-router-dom'
import {
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa'

export function AnnouncersPage() {
  const { data, isLoading, error } = useAnnouncers()

  if (isLoading) {
    return <div>Loading announcers...</div>
  }

  if (error) {
    return <div>Failed to load announcers</div>
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="mb-6 text-3xl font-bold">
        Voks Announcers
      </h1>

      <div className="grid grid-cols-2 gap-4">
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
  <h2 className="text-center text-xl font-bold">
    {announcer.title.rendered}
  </h2>
</div>
              </Link>
<div className="flex justify-center gap-3 pb-5">

  {announcer.acf?.link_instagram && (
    <a
      href={announcer.acf.link_instagram}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="
flex h-12 w-12 items-center justify-center
rounded-full
bg-pink-50
text-pink-600
transition-all
hover:scale-110
hover:bg-pink-100
"
    >
      <FaInstagram size={20} />
    </a>
  )}

  {announcer.acf?.link_tiktok && (
    <a
      href={announcer.acf.link_tiktok}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="
flex h-12 w-12 items-center justify-center
rounded-full
bg-gray-100
text-black
transition-all
hover:scale-110
hover:bg-gray-200
"
    >
      <FaTiktok size={20} />
    </a>
  )}

</div>
             
            </div>
          )
        })}
      </div>
    </div>
  )
}
