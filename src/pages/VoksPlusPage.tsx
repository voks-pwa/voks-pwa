import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { useVoksPlus } from '@/hooks/useVoksPlus'

const FILTERS = [
  'All',
  'Podcast',
  'Interview',
  'Music Room',
]

export function VoksPlusPage() {
  const { data, isLoading } =
    useVoksPlus()

  const [filter, setFilter] =
    useState('All')

  if (isLoading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  const filtered =
    filter === 'All'
      ? data
      : data?.filter(
          (item) =>
            item.acf?.content_type ===
            filter
        )

  return (
    <>
      <div className="p-6 pb-24">

        <h1 className="mb-6 text-3xl font-bold">
          Voks+
        </h1>

        <div className="mb-6 flex gap-2 overflow-x-auto">

          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() =>
                setFilter(item)
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                filter === item
                  ? 'bg-[#5B5B3F] text-white'
                  : 'bg-white'
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        <div className="grid grid-cols-2 gap-4">

          {filtered?.map((item) => {

            const image =
              item._embedded?.[
                'wp:featuredmedia'
              ]?.[0]?.media_details
                ?.sizes?.medium_large
                ?.source_url ??
              item._embedded?.[
                'wp:featuredmedia'
              ]?.[0]?.source_url

            return (
              <Link
                key={item.id}
                to={`/plus/${item.slug}`}
                className="
                  overflow-hidden
                  rounded-3xl
                  bg-white
                  shadow
                "
              >

                <div className="relative">

                  {image && (
                    <img
                      src={image}
                      alt={
                        item.title.rendered
                      }
                      className="
                        aspect-video
                        w-full
                        object-cover
                      "
                    />
                  )}

                  <div
                    className="
                      absolute
                      left-2
                      top-2
                      flex
                      items-center
                      gap-1
                      rounded-full
                      bg-black/70
                      px-2
                      py-1
                      text-xs
                      text-white
                    "
                  >
                    <PlayCircle size={12} />

                    {
                      item.acf?.duration
                    }
                  </div>

                </div>

                <div className="p-3">

                  <span
                    className="
                      rounded-full
                      bg-gray-100
                      px-2
                      py-1
                      text-[10px]
                      font-semibold
                    "
                  >
                    {
                      item.acf?.content_type
                    }
                  </span>

                  <h2
                    className="
                      mt-2
                      line-clamp-2
                      text-sm
                      font-bold
                    "
                  >
                    {
                      item.title.rendered
                    }
                  </h2>

                  <p
                    className="
                      mt-2
                      line-clamp-1
                      text-xs
                      text-gray-500
                    "
                  >
                    {
                      item.acf?.guest_name
                    }
                  </p>

                </div>

              </Link>
            )
          })}

        </div>

      </div>

      <BottomNavigation />
    </>
  )
}