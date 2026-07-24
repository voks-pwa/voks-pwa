import { useState } from 'react'

interface Props {
  publicUrl?: string | null
  alt: string
  className?: string
  fallback?: string
}

export function AssetImage({ publicUrl, alt, className, fallback }: Props) {
  const [error, setError] = useState(false)
  const src = publicUrl ?? null

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className ?? ''}`}>
        {fallback ? (
          <img src={fallback} alt={alt} className={className} />
        ) : (
          <span className="text-xs">No image</span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}