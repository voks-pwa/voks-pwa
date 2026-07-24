import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadAsset } from '../services/assetService'
import type { Asset } from '../types'

export function useAssetUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      assetType,
      ownerId,
    }: {
      file: File
      assetType: Asset['asset_type']
      ownerId: string
    }) => uploadAsset(file, assetType, ownerId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useAssetUploadWithReplace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      assetType,
      ownerId,
      oldAssetId,
    }: {
      file: File
      assetType: Asset['asset_type']
      ownerId: string
      oldAssetId?: string | null
    }) => {
      const { uploadAndReplace } = await import('../services/assetService')
      return uploadAndReplace(file, assetType, ownerId, oldAssetId)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}