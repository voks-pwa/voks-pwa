import { Link, useParams } from 'react-router-dom'
import { FaArrowLeft, FaInstagram } from 'react-icons/fa'
import { useProgramsByHost } from '@/hooks/useProgramsByHost'

import { useAnnouncer } from '@/hooks/useAnnouncer'

export function AnnouncerDetailPage() {
  const { slug } = useParams()

  const {
    data: announcer,
    isLoading,
    error,
  } = useAnnouncer(slug)

  const { programs } = useProgramsByHost(announcer?.title.rendered)

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (error || !announcer) {
    return (
      <div className="p-6">
        Announcer not found
      </div>
    )
  }

  const image =
    announcer._embedded?.['wp:featuredmedia']?.[0]
      ?.media_details?.sizes?.medium_large?.source_url ??
    announcer._embedded?.['wp:featuredmedia']?.[0]
      ?.source_url

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-3xl">

        <div className="p-6">
          <Link
            to="/announcers"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <FaArrowLeft />
            <span>Kembali ke Announcers</span>
          </Link>
        </div>

        {image && (
          <img
            src={image}
            alt={announcer.title.rendered}
            className="aspect-[4/5] w-full object-cover"
          />
        )}

        <div className="p-6">
          <h1 className="mb-6 text-4xl font-bold">
            {announcer.title.rendered}
          </h1>

          {announcer.acf?.link_instagram && (
            <a
              href={announcer.acf.link_instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-pink-600 hover:bg-pink-100"
            >
              <FaInstagram />
              Follow on Instagram
            </a>
          )}

          {announcer.acf?.short_description && (
            <div className="mt-8">
              <h2 className="mb-3 text-xl font-semibold">
                Tentang
              </h2>

              <p className="leading-7 text-gray-700">
                {announcer.acf.short_description}
              </p>
            </div>
          )}
        </div>
        {programs.length > 0 && (
  <div className="mt-10">
    <h2 className="mb-4 text-xl font-semibold">
      Program yang Dibawakan
    </h2>

    <div className="space-y-3">
      {programs.map((program) => (
        <Link
          key={program.id}
          to={`/programs/${program.slug}`}
          className="block rounded-xl border p-4 hover:bg-gray-50"
        >
          <h3 className="font-semibold">
            {program.title.rendered}
          </h3>

          <p className="text-sm text-gray-500">
            {program.acf?.jam_siaran}
          </p>
        </Link>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  )
}