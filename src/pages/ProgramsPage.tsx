import { usePrograms } from '@/hooks/usePrograms'
import { stripHtml } from '@/utils/html'
import { Link } from 'react-router-dom'

export function ProgramsPage() {
  const { data, isLoading, error } = usePrograms()

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6">Failed to load programs</div>
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="mb-6 text-3xl font-bold">
        Programs
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {data?.map((program) => {

  

  const image =
    program._embedded?.['wp:featuredmedia']?.[0]
      ?.media_details?.sizes?.medium_large?.source_url ??
    program._embedded?.['wp:featuredmedia']?.[0]
      ?.source_url

          return (
            <Link
              key={program.id}
              to={`/programs/${program.slug}`}
              className="overflow-hidden rounded-3xl bg-white shadow"
            >
            <article
              key={program.id}
              className="overflow-hidden rounded-3xl bg-white shadow"
            >
              {image && (
                <img
                  src={image}
                  alt={program.title.rendered}
                  className="aspect-square w-full object-cover"
                />
              )}

              <div className="p-5">
                <h2 className="mb-2 text-xl font-bold">
                  {program.title.rendered}
                </h2>

                {program.acf?.host && (
                  <p className="mb-2 text-sm text-secondary">
                    {program.acf.host}
                  </p>
                )}

                <p className="mb-1 text-sm">
                  {program.acf?.jadwal_hari}
                </p>

                <p className="mb-3 text-sm">
                  {program.acf?.jam_siaran}
                </p>
                <p className="line-clamp-4 text-sm">
                  {stripHtml(program.content.rendered)}
                </p>
              </div>
            </article>
              </Link>
          )
        })}
      </div>
    </div>
  )
}
