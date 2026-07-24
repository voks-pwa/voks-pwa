import { useAssetUpload } from '../hooks/useAssetUpload'
import type { Asset } from '../types'
import { useState, useRef } from 'react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

interface Props {
  assetType: Asset['asset_type']
  ownerId: string
  onSuccess?: (result: { assetId: string; publicUrl: string }) => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export function AssetUploader({ assetType, ownerId, onSuccess, onError, className, children }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useAssetUpload()

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError?.('Invalid file type. Allowed: JPEG, PNG, WebP')
      return
    }
    if (file.size > MAX_SIZE) {
      onError?.('File too large. Maximum 5 MB')
      return
    }

    try {
      const result = await upload.mutateAsync({ file, assetType, ownerId })
      onSuccess?.(result)
    } catch (err) {
      onError?.((err as Error).message ?? 'Upload failed')
    }
  }

  return (
    <div
      className={className}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {children ?? (
        <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
          {upload.isPending ? (
            <span className="text-sm text-gray-500">Uploading...</span>
          ) : (
            <span className="text-sm text-gray-500">Click or drag to upload</span>
          )}
        </div>
      )}
    </div>
  )
}