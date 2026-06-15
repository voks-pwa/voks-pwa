import { useMedia } from '@/hooks/useMedia'
import type { WordPressProgram } from '@/types/program'

interface ProgramScheduleCardProps {
  program: WordPressProgram
}

export function ProgramScheduleCard({
  program,
}: ProgramScheduleCardProps) {
  const { data: media } = useMedia(
    program.acf?.banner_program
  )

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow">
      {media?.source_url && (
        <img
          src={media.source_url}
          alt={program.title.rendered}
          className="aspect-video w-full object-cover"
        />
      )}

      <div className="p-4">
        <p className="text-sm text-gray-500">
          {program.acf?.jam_mulai?.slice(0, 5)}
          {' - '}
          {program.acf?.jam_selesai?.slice(0, 5)}
        </p>

        <h3 className="mt-1 text-lg font-bold">
          {program.title.rendered}
        </h3>

        <p className="text-sm text-gray-600">
          {program.acf?.penyiar}
        </p>
      </div>
    </div>
  )
}