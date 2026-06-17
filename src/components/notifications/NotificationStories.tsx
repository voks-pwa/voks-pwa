import { useEffect, useState } from 'react'

import { getMedia } from '@/services/wordpress-api'

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
  const [image, setImage] =
    useState('')

  useEffect(() => {
    async function load() {
      if (!imageId) return

      const media =
        await getMedia(imageId)

      setImage(media.source_url)
    }

    load()
  }, [imageId])

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
    >
      <div
        className="
          h-16
          w-16
          overflow-hidden
          rounded-full
          border-2
          border-[#bda752]
        "
      >
        {image && (
          <img
            src={image}
            alt={title}
            className="
              h-full
              w-full
              object-cover
            "
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