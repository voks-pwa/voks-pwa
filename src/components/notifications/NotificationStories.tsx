import { useMedia } from '@/hooks/useMedia'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface Props {
  imageId?: number

  title: string

  onClick: () => void
}

export function NotificationStory({
  imageId,
  title,
  onClick,
}: Props) {
  const { data: media } =
    useMedia(imageId)

  const image =
    media?.source_url ?? ''

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
    >
      <div
        className="
          h-[72px]
          w-[72px]
          overflow-hidden
          rounded-full
          border-2
          border-[#bda752]
          shadow-sm
        "
      >
        {image && (
          <OptimizedImage
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <span
        className="
          mt-2
          max-w-[70px]
          truncate
          text-xs
        "
      >
        {title}
      </span>
    </button>
  )
}