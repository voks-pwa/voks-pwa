export type AssetType =
  | 'avatar'
  | 'announcer'
  | 'program'
  | 'campaign'
  | 'reward'
  | 'marketplace'
  | 'badge'
  | 'achievement'
  | 'promo'

export interface Asset {
  id: string
  owner_id: string | null
  asset_type: AssetType
  storage_path: string
  public_url: string
  thumbnail_url: string | null
  mime_type: string
  size: number
  width: number | null
  height: number | null
  created_at: string
  updated_at: string
}

export interface AssetInsert {
  owner_id?: string
  asset_type: AssetType
  storage_path: string
  public_url: string
  thumbnail_url?: string
  mime_type?: string
  size?: number
  width?: number
  height?: number
}

export interface AssetUploadInput {
  file: File
  assetType: AssetType
  ownerId: string
}

export interface AssetUploadResult {
  assetId: string
  publicUrl: string
  thumbnailUrl: string | null
}