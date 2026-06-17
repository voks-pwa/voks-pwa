import { Link } from 'react-router-dom'

import { usePrograms } from '@/hooks/usePrograms'

export function FeaturedPrograms() {
  const { data: programs } =
    usePrograms()

  if (!programs?.length) {
    return null
  }

  const featuredPrograms =
    programs.slice(0, 4)

  return (
    <section className="rounded-3xl bg-white p-6 shadow">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Programs
          </p>

          <h2 className="text-xl font-bold">
            Featured Programs
          </h2>
        </div>

        <Link
          to="/programs"
          className="text-sm font-medium text-primary"
        >
          View All
        </Link>

      </div>

      <div className="grid grid-cols-2 gap-4">

        {featuredPrograms.map(
          (program) => {
            const image =
              program._embedded?.[
                'wp:featuredmedia'
              ]?.[0]?.media_details
                ?.sizes?.medium_large
                ?.source_url ??
              program._embedded?.[
                'wp:featuredmedia'
              ]?.[0]?.source_url

            return (
              <Link
                key={program.id}
                to={`/programs/${program.slug}`}
                className="
                  overflow-hidden
                  rounded-3xl
                  bg-gray-50
                "
              >
                {image && (
                  <img
                    src={image}
                    alt={
                      program.title
                        .rendered
                    }
                    className="
                      aspect-square
                      w-full
                      object-cover
                    "
                  />
                )}

                <div className="p-3">

                  <h3
                    className="
                      line-clamp-2
                      text-sm
                      font-bold
                    "
                  >
                    {
                      program.title
                        .rendered
                    }
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    {program.acf?.host}
                  </p>

                </div>

              </Link>
            )
          }
        )}

      </div>

    </section>
  )
}