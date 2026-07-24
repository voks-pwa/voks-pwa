import { supabase } from '@/lib/supabase'
import { uploadAsset, removeAsset } from '@/features/assets/services/assetService'
import { getAsset } from '@/features/assets/repositories/assetRepository'

const AVATAR_MAX_WIDTH = 400
const AVATAR_MAX_HEIGHT = 400
const AVATAR_QUALITY = 0.8

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > AVATAR_MAX_WIDTH || height > AVATAR_MAX_HEIGHT) {
        const ratio = Math.min(AVATAR_MAX_WIDTH / width, AVATAR_MAX_HEIGHT / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/webp', AVATAR_QUALITY)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: 'image/webp' })
}

// New: upload via Asset Management System (Worker → R2)
export async function uploadAvatarViaAsset(userId: string, file: File): Promise<{ assetId: string; publicUrl: string }> {
  const resized = await resizeImage(file)
  const assetFile = blobToFile(resized, `${userId}-avatar.webp`)
  const result = await uploadAsset(assetFile, 'avatar', userId)
  return { assetId: result.assetId, publicUrl: result.publicUrl }
}

// Legacy: upload directly to Supabase Storage (falls back if Worker unavailable)
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const result = await uploadAvatarViaAsset(userId, file)
    return result.publicUrl
  } catch {
    // Fallback: legacy Supabase Storage upload
    const resized = await resizeImage(file)
    const path = `${userId}/avatar.jpg`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, resized, { contentType: 'image/jpeg', upsert: true })
    if (uploadError) {
      if (uploadError.message?.includes('bucket')) {
        await supabase.storage.createBucket('avatars', { public: true })
        const { error: retryError } = await supabase.storage
          .from('avatars')
          .upload(path, resized, { contentType: 'image/jpeg', upsert: true })
        if (retryError) throw retryError
      } else {
        throw uploadError
      }
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }
}

// New: delete via Asset Management System
export async function deleteOldAvatarViaAsset(assetId: string | null): Promise<boolean> {
  if (!assetId) return false
  return removeAsset(assetId)
}

// Legacy: delete from Supabase Storage
export async function deleteOldAvatar(url: string | null) {
  try {
    await removeAssetByUrl(url)
  } catch {
    // swallow
  }
}

async function removeAssetByUrl(url: string | null) {
  if (!url) return
  const parsed = new URL(url)
  const pathMatch = parsed.pathname.match(/\/avatars\/(.+)$/)
  if (pathMatch) {
    await supabase.storage.from('avatars').remove([pathMatch[1]])
  }
}

export function getAvatarSrc(profileAvatar: string | null, userMetadata: Record<string, unknown> | undefined) {
  if (profileAvatar) {
    if (/^https?:\/\//i.test(profileAvatar)) return profileAvatar
    const { data } = supabase.storage.from('avatars').getPublicUrl(profileAvatar)
    return data.publicUrl
  }
  const meta = userMetadata as Record<string, string | undefined> | undefined
  return meta?.avatar_url ?? meta?.picture ?? 'https://placehold.co/200'
}

export async function resolveAvatarUrl(assetIdOrUrl: string | null): Promise<string | null> {
  if (!assetIdOrUrl) return null
  if (/^https?:\/\//i.test(assetIdOrUrl)) return assetIdOrUrl
  const asset = await getAsset(assetIdOrUrl)
  return asset?.public_url ?? null
}