import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'

export function useMissionProgress() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['missions-progress', user?.id],

    enabled: !!user,

    queryFn: async () => {
      const result = await supabase
        .from('missions_progress')
        .select('*')
        .eq('user_id', user!.id)

      console.log(
        'MISSION PROGRESS RAW',
        result
      )

      if (result.error)
        throw result.error

      return result.data ?? []
    },
  })
}