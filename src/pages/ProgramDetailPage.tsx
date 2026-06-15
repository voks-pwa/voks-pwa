import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { useProgram } from '@/hooks/useProgram'
import { stripHtml } from '@/utils/html'

export function ProgramDetailPage() {
  const { slug } = useParams()

  const {
    data: program,
    isLoading,
    error,
  } = useProgram(slug)

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
      <div className="p-4">
</div>

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

        {program.acf?.host && (
          <p className="mb-2">
            Host: {program.acf.host}
          </p>
        )}

        <p>{program.acf?.jadwal_hari}</p>

        <p className="mb-6">
          {program.acf?.jam_siaran}
        </p>

        <p className="leading-7">
          {stripHtml(program.content.rendered)}
        </p>

      </div>
    </div>
  )
}