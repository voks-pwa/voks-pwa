import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { useProgram } from '@/hooks/useProgram'
import { useAnnouncersByIds } from '@/hooks/useAnnouncer'


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