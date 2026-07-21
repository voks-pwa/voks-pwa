import { useFeatureFlags } from '@/features/operations'
import { featureFlags, type FeatureKey } from './index'

export function useIsFeatureEnabled(feature: FeatureKey): boolean {
  const { data: dbFlags } = useFeatureFlags()
  const dbFlag = dbFlags?.find(f => f.key === feature)
  return dbFlag?.enabled ?? featureFlags[feature].public_enabled
}
