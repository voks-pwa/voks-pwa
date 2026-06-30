import { supabase } from '@/lib/supabase'

import { getBadge } from './getBadge'

export async function addXP(
  userId: string,
  amount: number,
  activity: string
) {
  console.log('ADD XP', { userId, amount, activity })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,current_vxp,lifetime_vxp,role')
    .eq('id', userId)
    .maybeSingle()

  if (profileError || !profile) {
    console.error('PROFILE LOAD ERROR', profileError)
    return {
      success: false,
      message: 'Profile not found',
      amount: 0,
    }
  }

  const currentVxp = Number(profile.current_vxp ?? 0)
  const lifetimeVxp = Number(profile.lifetime_vxp ?? 0)
  const badge = getBadge(lifetimeVxp, profile.role)

  const { error: badgeError } = await supabase
    .from('profiles')
    .update({ badge_name: badge })
    .eq('id', userId)

  if (badgeError) {
    console.error('BADGE UPDATE ERROR', badgeError)
    return {
      success: false,
      message: 'Badge update failed',
      amount: 0,
    }
  }

  const { error: activityError } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      activity_type: activity,
      xp: amount,
    })

  if (activityError) {
    console.error('ACTIVITY LOG ERROR', activityError)
    return {
      success: false,
      message: 'Activity log failed',
      amount: 0,
    }
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('increment_vxp', {
    uid: userId,
    amount,
  })

  console.log('SUPABASE RPC', { rpcData, rpcError })

  if (rpcError) {
    console.error('SUPABASE RPC ERROR', rpcError)
    return {
      success: false,
      message: 'XP RPC failed',
      amount: 0,
    }
  }

  return {
    success: true,
    message: 'XP awarded',
    amount,
    currentVxp: Number(rpcData?.current_vxp ?? currentVxp + amount),
    lifetimeVxp: Number(rpcData?.lifetime_vxp ?? lifetimeVxp + amount),
  }
}