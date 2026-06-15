import { useMedia } from '@/hooks/useMedia'
import type { WordPressProgram } from '@/types/programs'

interface Props {
  program: WordPressProgram
}

export function ProgramCard({
  program,
}: Props) {
  const { data: image } = useMedia(
    program.acf.gambar_landscape
  )

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
      {image && (
        <img
          src={image.source_url}
          alt={program.title.rendered}
          className="h-48 w-full object-cover"
        />
      )}

      <div className="p-5">
        <h2 className="text-xl font-bold">
          {program.title.rendered}
        </h2>

        {program.acf.host && (
          <p className="mt-1 text-sm text-secondary">
            {program.acf.host}
          </p>
        )}

        <p className="mt-2 text-sm text-primary">
          {program.acf.jadwal_hari}
        </p>

        <p className="text-sm text-primary">
          {program.acf.jam_siaran}
        </p>
      </div>
    </article>
  )
}