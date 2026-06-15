import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { useProgram } from '@/hooks/useProgram'
import { useAnnouncersByIds } from '@/hooks/useAnnouncer'
import { FaShareAlt } from 'react-icons/fa'


export function ProgramDetailPage() {
  const { slug } = useParams()

  const {
    data: program,
    isLoading,
    error,
  } = useProgram(slug)

  const announcers = useAnnouncersByIds(
    program?.acf?.announcers
  )

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (error || !program) {
    return (
      <div className="p-6">
        Program not found
      </div>
    )
  }

  const image =
    program._embedded?.['wp:featuredmedia']?.[0]
      ?.source_url

  return (
    <div className="mx-auto max-w-3xl">

      {image && (
        <img
          src={image}
          alt={program.title.rendered}
          className="aspect-video w-full object-cover"
        />
      )}

      <div className="p-6">

        <Link
          to="/programs"
          className="mb-4 inline-block text-sm font-medium text-primary"
        >
          ← Kembali ke Programs
        </Link>

        <h1 className="mb-3 text-4xl font-bold">
          {program.title.rendered}
        </h1>
        <button
  onClick={async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: program.title.rendered,
          text: `Dengarkan program ${program.title.rendered} di Voks Radio`,
          url: shareUrl,
        })
      } catch {
        // user cancel
      }
    } else {
      await navigator.clipboard.writeText(
        shareUrl
      )

      alert(
        'Link program berhasil disalin'
      )
    }
  }}
  className="
    mb-6
    inline-flex
    items-center
    gap-2
    rounded-full
    bg-[#bda752]
    px-4
    py-2
    text-white
    hover:opacity-90
  "
>
  <FaShareAlt />
<span>Bagikan Program</span>
  </button>

        {announcers.length > 0 && (
          <div className="mb-6 space-y-3">

            <p className="text-sm font-semibold text-gray-500">
              Announcers
            </p>

            {announcers.map((announcer) => (
              <Link
                key={announcer.id}
                to={`/announcers/${announcer.slug}`}
                className="flex items-center gap-3 rounded-xl border p-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">
                    {announcer.title.rendered}
                  </p>
                </div>
              </Link>
            ))}

          </div>
        )}

        <p>{program.acf?.jadwal_hari}</p>

        <p className="mb-6">
          {program.acf?.jam_siaran}
        </p>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: program.content.rendered,
          }}
        />

      </div>

    </div>
  )
}