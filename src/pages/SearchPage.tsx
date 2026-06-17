import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  Search,
  Radio,
  Mic2,
  Podcast,
} from 'lucide-react'

import { usePrograms } from '@/hooks/usePrograms'
import { useAnnouncers } from '@/hooks/useAnnouncers'
import { useVoksPlus } from '@/hooks/useVoksPlus'

export function SearchPage() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')

  const { data: programs } =
    usePrograms()

  const { data: announcers } =
    useAnnouncers()

  const { data: voksPlus } =
    useVoksPlus()

  const search =
    query.toLowerCase()

  const filteredPrograms =
    useMemo(
      () =>
        programs?.filter((item) =>
          item.title.rendered
            .toLowerCase()
            .includes(search)
        ) ?? [],
      [programs, search]
    )

  const filteredAnnouncers =
    useMemo(
      () =>
        announcers?.filter((item) =>
          item.title.rendered
            .toLowerCase()
            .includes(search)
        ) ?? [],
      [announcers, search]
    )

  const filteredVoksPlus =
    useMemo(
      () =>
        voksPlus?.filter((item) =>
          item.title.rendered
            .toLowerCase()
            .includes(search)
        ) ?? [],
      [voksPlus, search]
    )

  return (
    <div className="p-6 pb-24">

      {/* HEADER */}

      <div className="mb-6 flex items-center gap-4">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white
            shadow
          "
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-3xl font-bold">
          Search
        </h1>

      </div>

      {/* SEARCH BOX */}

      <div
        className="
          sticky
          top-4
          z-20
          mb-8
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-3xl
            border
            border-gray-100
            bg-white/90
            px-5
            py-4
            shadow-lg
            backdrop-blur
          "
        >
          <Search
            size={20}
            className="text-gray-400"
          />

          <input
            autoFocus
            type="text"
            placeholder="Search Voks Radio..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            className="
              w-full
              bg-transparent
              text-sm
              outline-none
            "
          />

          {query && (
            <button
              onClick={() =>
                setQuery('')
              }
              className="
                text-xl
                text-gray-400
              "
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}

      {query.length === 0 && (
        <div className="space-y-8">

          <div>

            <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
              Trending Searches
            </h2>

            <div className="flex flex-wrap gap-2">

              {[
                'Face To Face',
                'Podcast',
                'Morning Zone',
                'Drive N Jive',
                'Interview',
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setQuery(item)
                  }
                  className="
                    rounded-full
                    bg-white
                    px-4
                    py-2
                    text-sm
                    shadow
                  "
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow">

            <p className="text-center text-gray-500">
              Search programs,
              announcers, podcasts,
              interviews and Voks+
              content.
            </p>

          </div>

        </div>
      )}

      {/* RESULTS */}

      {query.length > 0 && (
        <div className="space-y-8">

          {/* PROGRAMS */}

          {filteredPrograms.length >
            0 && (
            <section>

              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                <Radio size={16} />
                Programs
              </h2>

              <div className="space-y-3">

                {filteredPrograms.map(
                  (item) => {
                    const image =
                      item
                        ._embedded?.[
                        'wp:featuredmedia'
                      ]?.[0]
                        ?.media_details
                        ?.sizes
                        ?.medium_large
                        ?.source_url ??
                      item
                        ._embedded?.[
                        'wp:featuredmedia'
                      ]?.[0]
                        ?.source_url

                    return (
                      <Link
                        key={
                          item.id
                        }
                        to={`/programs/${item.slug}`}
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-3xl
                          bg-white
                          p-3
                          shadow
                        "
                      >
                        {image && (
                          <img
                            src={
                              image
                            }
                            alt={
                              item
                                .title
                                .rendered
                            }
                            className="
                              h-16
                              w-16
                              rounded-2xl
                              object-cover
                            "
                          />
                        )}

                        <div>

                          <h3 className="font-semibold">
                            {
                              item
                                .title
                                .rendered
                            }
                          </h3>

                          <p className="text-xs text-gray-500">
                            Program
                          </p>

                        </div>

                      </Link>
                    )
                  }
                )}

              </div>

            </section>
          )}

          {/* HOSTS */}

          {filteredAnnouncers.length >
            0 && (
            <section>

              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                <Mic2 size={16} />
                Hosts
              </h2>

              <div className="space-y-3">

                {filteredAnnouncers.map(
                  (item) => {
                    const image =
                      item
                        ._embedded?.[
                        'wp:featuredmedia'
                      ]?.[0]
                        ?.media_details
                        ?.sizes
                        ?.medium_large
                        ?.source_url ??
                      item
                        ._embedded?.[
                        'wp:featuredmedia'
                      ]?.[0]
                        ?.source_url

                    return (
                      <Link
                        key={
                          item.id
                        }
                        to={`/announcers/${item.slug}`}
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-3xl
                          bg-white
                          p-3
                          shadow
                        "
                      >
                        {image && (
                          <img
                            src={
                              image
                            }
                            alt={
                              item
                                .title
                                .rendered
                            }
                            className="
                              h-16
                              w-16
                              rounded-full
                              object-cover
                            "
                          />
                        )}

                        <div>

                          <h3 className="font-semibold">
                            {
                              item
                                .title
                                .rendered
                            }
                          </h3>

                          <p className="text-xs text-gray-500">
                            Host
                          </p>

                        </div>

                      </Link>
                    )
                  }
                )}

              </div>

            </section>
          )}

          {/* VOKS+ */}

          {filteredVoksPlus.length >
            0 && (
            <section>

              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                <Podcast size={16} />
                Voks+
              </h2>

              <div className="space-y-3">

                {filteredVoksPlus.map(
                  (item) => {
                    const image =
                      item
                        ._embedded?.[
                        'wp:featuredmedia'
                      ]?.[0]
                        ?.media_details
                        ?.sizes
                        ?.medium_large
                        ?.source_url ??
                      item
                        ._embedded?.[
                        'wp:featuredmedia'
                      ]?.[0]
                        ?.source_url

                    return (
                      <Link
                        key={
                          item.id
                        }
                        to={`/plus/${item.slug}`}
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-3xl
                          bg-white
                          p-3
                          shadow
                        "
                      >
                        {image && (
                          <img
                            src={
                              image
                            }
                            alt={
                              item
                                .title
                                .rendered
                            }
                            className="
                              h-16
                              w-24
                              rounded-2xl
                              object-cover
                            "
                          />
                        )}

                        <div>

                          <span
                            className="
                              rounded-full
                              bg-gray-100
                              px-2
                              py-1
                              text-xs
                            "
                          >
                            {
                              item
                                .acf
                                ?.content_type
                            }
                          </span>

                          <h3 className="mt-2 font-semibold">
                            {
                              item
                                .title
                                .rendered
                            }
                          </h3>

                        </div>

                      </Link>
                    )
                  }
                )}

              </div>

            </section>
          )}

          {filteredPrograms.length ===
            0 &&
            filteredAnnouncers.length ===
              0 &&
            filteredVoksPlus.length ===
              0 && (
              <div className="rounded-3xl bg-white p-8 text-center shadow">

                <p className="text-gray-500">
                  No results found.
                </p>

              </div>
            )}

        </div>
      )}

    </div>
  )
}