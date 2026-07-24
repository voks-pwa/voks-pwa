import { supabase } from '@/lib/supabase'
import type { Asset, AssetUploadResult } from '../types'
import { deleteAsset, getAsset } from '../repositories/assetRepository'

const UPLOAD_GATEWAY_URL = import.meta.env.VITE_UPLOAD_GATEWAY_URL ?? '/api/upload'

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function uploadAsset(
  file: File,
  assetType: Asset['asset_type'],
  ownerId: string,
): Promise<AssetUploadResult> {
  const token = await getAuthToken()
  if (!token) throw new Error('Authentication required')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('asset_type', assetType)
  formData.append('owner_id', ownerId)

  const response = await fetch(UPLOAD_GATEWAY_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error ?? `Upload failed (${response.status})`)
  }

  return response.json()
}

export async function getAssetUrl(assetId: string): Promise<string | null> {
  const asset = await getAsset(assetId)
  return asset?.public_url ?? null
}

export async function removeAsset(assetId: string): Promise<boolean> {
  const token = await getAuthToken()
  if (!token) throw new Error('Authentication required')

  const response = await fetch(`${UPLOAD_GATEWAY_URL}?asset_id=${assetId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return false

  await deleteAsset(assetId)
  return true
}

export async function uploadAndReplace(
  file: File,
  assetType: Asset['asset_type'],
  ownerId: string,
  oldAssetId?: string | null,
): Promise<AssetUploadResult> {
  if (oldAssetId) {
    await removeAsset(oldAssetId).catch(() => {})
  }
  return uploadAsset(file, assetType, ownerId)
}