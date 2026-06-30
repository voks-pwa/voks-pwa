import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'

import { useVoksPlus } from '@/hooks/useVoksPlus'

const FILTERS = [
  'All',
  'Podcast',
  'Interview',
  'Music Room',
]

// 🌟 FUNGSI PEMBANTU: Mendekode entitas HTML (seperti &#8211;) menjadi teks normal
function decodeHtmlEntities(text: string) {
  if (!text) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  return doc.documentElement.textContent || text
}

export function VoksPlusPage() {
  const { data, isLoading } = useVoksPlus()
  const [filter, setFilter] = useState('All')

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center gap-2 text-sm font-medium text-gray-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#bda752] border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const filtered =
    filter === 'All'
      ? data
      : data?.filter(
          (item) => item.acf?.content_type === filter
        )

  return (
      <div className="p-6 pb-24">
        
        <h1 className="mb-6 text-3xl font-black tracking-tight text-gray-900">
          Voks+
        </h1>

        {/* PILIHAN FILTER HORIZONTAL */}
        <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm border ${
                filter === item
                  ? 'bg-[#5B5B3F] text-white border-[#5B5B3F]'
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* GRID DAFTAR KONTEN */}
        <div className="grid grid-cols-2 gap-4">
          {filtered?.map((item) => {
            const image =
              item._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium_large?.source_url ??
              item._embedded?.['wp:featuredmedia']?.[0]?.source_url

            // 🌟 PROSES DEKODE: Bersihkan judul dari entitas HTML seperti &#8211;
            const decodedTitle = decodeHtmlEntities(item.title?.rendered || '')

            return (
              <Link
                key={item.id}
                to={`/plus/${item.slug}`}
                className="overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative">
                  {image && (
                    <img
                      src={image}
                      alt={decodedTitle}
                      className="aspect-video w-full object-cover bg-gray-100"
                    />
                  )}

                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                    <PlayCircle size={12} />
                    {item.acf?.duration}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="rounded-md bg-amber-50 border border-amber-100/30 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wide">
                      {item.acf?.content_type}
                    </span>

                    {/* MENAMPILKAN JUDUL YANG SUDAH BERSIH */}
                    <h2 className="mt-2 line-clamp-2 text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                      {decodedTitle}
                    </h2>
                  </div>

                  <p className="mt-2 line-clamp-1 text-[11px] font-medium text-gray-400">
                    {item.acf?.guest_name}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
  )
}
