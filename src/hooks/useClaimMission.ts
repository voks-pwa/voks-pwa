import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/query-client'

export function useClaimMission() {
  return useMutation({
    mutationFn: async ({
      userId,
      missionId,
      vxp,
    }: {
      userId: string
      missionId: number
      vxp: number
    }) => {

        console.log(
    'CLAIM START',
    userId,
    missionId,
    vxp
  )
  

      // ambil profile

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id,lifetime_vxp')
        .eq('id', userId)
        .single()

        console.log(
  'PROFILE RESULT',
  profile,
  profileError
)


      if (profileError) {
        throw profileError
      }

      // tambah vxp

      const newVxp =
        (profile.lifetime_vxp ?? 0) + vxp

      const { error: updateProfileError } =
        await supabase
          .from('profiles')
          .update({
            lifetime_vxp: newVxp,
          })
          .eq('id', userId)

          console.log(
  'UPDATE PROFILE ERROR',
  updateProfileError
)

      if (updateProfileError) {
        throw updateProfileError
      }

      // tandai mission claimed

      const {
        error: claimError,
      } = await supabase
        .from('missions_progress')
        .update({
          claimed: true,
          claimed_at:
            new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)

        console.log(
              'CLAIM ERROR',
            claimError
          )

          console.log(
            'CLAIM RESULT',
            claimError
          )

      if (claimError) {
        throw claimError
      }

      return true
    },

    onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['missions-progress'],
    exact: false,
  })

  queryClient.invalidateQueries({
    queryKey: ['profile'],
    exact: false,
  })
},
  })
}