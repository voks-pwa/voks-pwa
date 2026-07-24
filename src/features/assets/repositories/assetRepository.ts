import { supabase } from '@/lib/supabase'
import type { Asset, AssetInsert } from '../types'

export async function getAsset(id: string): Promise<Asset | null> {
  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data as Asset | null
}

export async function getAssetsByOwner(ownerId: string): Promise<Asset[]> {
  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return (data as Asset[]) ?? []
}

export async function getAssetsByType(assetType: string): Promise<Asset[]> {
  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('asset_type', assetType)
    .order('created_at', { ascending: false })
  return (data as Asset[]) ?? []
}

export async function insertAsset(input: AssetInsert): Promise<Asset | null> {
  const { data } = await supabase
    .from('assets')
    .insert({
      owner_id: input.owner_id,
      asset_type: input.asset_type,
      storage_path: input.storage_path,
      public_url: input.public_url,
      thumbnail_url: input.thumbnail_url ?? null,
      mime_type: input.mime_type ?? 'image/webp',
      size: input.size ?? 0,
      width: input.width ?? null,
      height: input.height ?? null,
    })
    .select()
    .single()
  return data as Asset | null
}

export async function deleteAsset(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
  return !error
}

export async function getAssetByStoragePath(storagePath: string): Promise<Asset | null> {
  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('storage_path', storagePath)
    .maybeSingle()
  return data as Asset | null
}