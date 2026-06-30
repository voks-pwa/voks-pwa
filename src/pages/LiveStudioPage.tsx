import { LiveStudioPlayer } from '@/components/live/LiveStudioPlayer'
import { useCurrentProgram } from '@/hooks/useCurrentProgram'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

import { supabase } from '@/lib/supabase'

console.log('Supabase OK', supabase)

export function LiveStudioPage() {
  const currentProgram =
    useCurrentProgram()

  const image =
    currentProgram?._embedded?.[
      'wp:featuredmedia'
    ]?.[0]?.source_url

  async function handleShare() {
    try {
      await navigator.share({
        title: 'Voks Radio Live Studio',
        text: `Watch ${
          currentProgram?.title.rendered ??
          'Voks Radio'
        } live now`,
        url: 'https://live.voksradio.com',
      })
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="p-6 pb-24">
        <div className="mb-6">
  <Link
  to="/"
  className="
    mb-4
    inline-flex
    items-center
    gap-2
    rounded-full
    bg-white
    px-4
    py-2
    shadow
  "
>
  <FaArrowLeft />
  Home
</Link>
</div>

      <h1 className="mb-6 text-3xl font-bold">
        Live Studio
      </h1>

      <LiveStudioPlayer />

      <div className="mt-4 grid grid-cols-3 gap-3">

  <Link
    to="/"
    className="rounded-2xl bg-white p-4 text-center shadow"
  >
    🏠
    <p className="mt-2 text-xs">
      Home
    </p>
  </Link>

  <Link
    to="/plus"
    className="rounded-2xl bg-white p-4 text-center shadow"
  >
    🎙
    <p className="mt-2 text-xs">
      Voks+
    </p>
  </Link>

  <Link
    to="/programs"
    className="rounded-2xl bg-white p-4 text-center shadow"
  >
    📻
    <p className="mt-2 text-xs">
      Programs
    </p>
  </Link>

</div>

      {currentProgram && (
        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow">

          {image && (
            <img
              src={image}
              alt={
                currentProgram.title.rendered
              }
              className="aspect-video w-full object-cover"
            />
          )}

          <div className="p-6">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
              <span
                className="h-2.5 w-2.5 rounded-full bg-red-600"
                aria-hidden="true"
              />
              ON AIR NOW
            </div>

            <h2 className="text-2xl font-bold">
              {
                currentProgram.title
                  .rendered
              }
            </h2>

            <p className="mt-2 text-gray-600">
              {
                currentProgram.acf
                  ?.host
              }
            </p>

            <p className="mt-3 text-sm text-gray-500">
              {
                currentProgram.acf
                  ?.jadwal_hari
              }
            </p>

            <p className="text-sm text-gray-500">
              {
                currentProgram.acf
                  ?.jam_siaran
              }
            </p>

            <button
              onClick={handleShare}
              className="
                mt-5
                rounded-full
                px-5
                py-2
                text-white
                transition
                hover:opacity-90
              "
              style={{
                backgroundColor: '#5B5B3F',
              }}
            >
              Share Live
            </button>

          </div>
        </div>
      )}

      <section className="mt-8">

        <h2 className="mb-4 text-xl font-bold">
          Live Chat
        </h2>

        <div className="overflow-hidden rounded-3xl border bg-white shadow">

          <iframe
            src="https://live.voksradio.com/embed/chat/readwrite"
            title="Live Chat"
            className="h-[500px] w-full border-0"
        />

        </div>

      </section>

    </div>
  )
}