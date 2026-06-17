import { useParams } from 'react-router-dom'
import { useVoksPlusItem } from '@/hooks/useVoksPlusItem'

function getYoutubeId(url?: string) {
  if (!url) return ''

  const match = url.match(
    /(?:youtu\.be\/|v=)([^&]+)/i
  )

  return match?.[1] ?? ''
}

export function VoksPlusDetailPage() {
  const { slug } = useParams()

  const { data } =
    useVoksPlusItem(slug)

  if (!data) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  const videoId = getYoutubeId(
    data.acf?.youtube_url
  )

  return (
    <div className="p-6 pb-24">

      <h1 className="mb-4 text-3xl font-bold">
        {data.title.rendered}
      </h1>

      <div className="overflow-hidden rounded-3xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={data.title.rendered}
          allowFullScreen
          className="aspect-video w-full"
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase text-gray-500">
          {data.acf?.content_type}
        </p>

        <h2 className="mt-2 text-xl font-bold">
          {data.acf?.guest_name}
        </h2>

        <p className="mt-2 text-gray-500">
          {data.acf?.duration}
        </p>
      </div>

    </div>
  )
}