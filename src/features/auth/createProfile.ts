import { supabase } from '@/lib/supabase'

import {
  getReferralCode,
  clearReferralCode,
} from '@/lib/referralStorage'

import { trackMission } from '@/hooks/useMissionTracker'

function generateReferralCode() {
  return (
    'VOKS-' +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  )
}

export async function createProfile(
  user: any
) {
  const referredBy =
    getReferralCode()

  const referralCode =
    generateReferralCode()

  console.log(
    '========== CREATE PROFILE =========='
  )

  console.log({
    userId: user.id,
    email: user.email,
    referralCode,
    referredBy,
  })

  //------------------------------------
  // INSERT PROFILE
  //------------------------------------

  const {
    data: insertedProfile,
    error: insertError,
  } = await supabase
    .from('profiles')
    .insert({
      id: user.id,

      email: user.email,

      display_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email,

      avatar_url:
        user.user_metadata?.avatar_url ??
        user.user_metadata?.picture ??
        null,

      role: 'listener',

      current_vxp: 0,

      lifetime_vxp: 0,

      badge_name:
        'Pendatang Baru',

      referral_code:
        referralCode,

      referred_by:
        referredBy,
    })
    .select()
    .single()

  console.log(
    'INSERT RESULT',
    insertedProfile,
    insertError
  )

  if (insertError) {
    console.error(
      'INSERT PROFILE FAILED',
      insertError
    )

    return
  }

  //------------------------------------
  // TIDAK ADA REFERRAL
  //------------------------------------

  if (!referredBy) {

    console.log(
      'NO REFERRAL USED'
    )

    clearReferralCode()

    return
  }

  //------------------------------------
  // CARI PEMILIK REFERRAL
  //------------------------------------

  console.log(
    'SEARCH OWNER OF',
    referredBy
  )

  const {
    data: referrer,
    error: referrerError,
  } = await supabase
    .from('profiles')
    .select('id, referral_code')
    .eq(
      'referral_code',
      referredBy
    )
    .maybeSingle()

  console.log(
    'REFERRER QUERY',
    referrer,
    referrerError
  )

  if (!referrer) {

    console.log(
      'REFERRAL OWNER NOT FOUND'
    )

    clearReferralCode()

    return
  }

  //------------------------------------
  // TRACK MISSION
  //------------------------------------

  console.log(
    'TRACK REFERRAL MISSION',
    referrer.id
  )

  await trackMission({
    userId: referrer.id,
    missionId: 12342,
    amount: 1,
  })

  console.log(
    'REFERRAL TRACKED'
  )

  clearReferralCode()

  console.log(
    '========== FINISH =========='
  )
}