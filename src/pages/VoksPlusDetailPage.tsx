import { useParams, useNavigate } from 'react-router-dom'
import { useVoksPlusItem } from '@/hooks/useVoksPlusItem'
import { ArrowLeft } from 'lucide-react'

// Fungsi pembantu untuk mengekstrak ID video Youtube dari tautan URL
function getYoutubeId(url?: string) {
  if (!url) return ''

  const match = url.match(
    /(?:youtu\.be\/|v=)([^&]+)/i
  )

  return match?.[1] ?? ''
}

// Fungsi pembantu untuk memproses entitas HTML (seperti &#8211;) menjadi teks biasa
function decodeHtmlEntities(text: string) {
  if (!text) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  return doc.documentElement.textContent || text
}

export function VoksPlusDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data } = useVoksPlusItem(slug)

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-sm font-medium text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#bda752] border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const videoId = getYoutubeId(data.acf?.youtube_url)
  
  // Memproses judul agar bersih dari kode entitas HTML seperti &#8211;
  const decodedTitle = decodeHtmlEntities(data.title?.rendered || '')

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-6">
        
        {/* HEADER DENGAN BUTTON KEMBALI */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight line-clamp-2">
            {decodedTitle}
          </h1>
        </div>

        {/* YOUTUBE IFRAME EMBED PLAYER */}
        <div className="overflow-hidden rounded-3xl bg-black shadow-sm border border-gray-100 aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={decodedTitle}
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* DATA METADATA KONTEN VOKS+ */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Content Type
              </p>
              <p className="mt-0.5 text-sm font-bold text-amber-600/90 bg-amber-50 inline-block px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                {data.acf?.content_type || 'MUSIC ROOM'}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Duration
              </p>
              <p className="mt-1 text-sm font-bold text-gray-500">
                ⏱ {data.acf?.duration || '0:00'}
              </p>
            </div>
          </div>

          <div className="pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Starring Guest
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold text-gray-800 tracking-tight">
              {data.acf?.guest_name || 'Phantom'}
            </h2>
          </div>
        </div>

      </div>
    </div>
  )
}