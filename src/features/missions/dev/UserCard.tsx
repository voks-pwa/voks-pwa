import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  userId: string
}

export function UserCard({
  userId,
}: Props) {

  const [profile, setProfile] =
    useState<any>(null)

  async function loadProfile() {

    const { data } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    setProfile(data)

  }

  useEffect(() => {

    if (userId) {
      loadProfile()
    }

  }, [userId])

  if (!profile) {

    return (
      <div className="rounded-xl border p-5">
        Loading Profile...
      </div>
    )

  }

  return (

    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-4 text-lg font-bold">
        USER PROFILE
      </h2>

      <div className="space-y-2 text-sm">

        <div>

          <b>ID</b>

          <br />

          {profile.id}

        </div>

        <div>

          <b>Name</b>

          <br />

          {profile.display_name}

        </div>

        <div>

          <b>Email</b>

          <br />

          {profile.email}

        </div>

        <div>

          <b>Current VXP</b>

          <br />

          {profile.current_vxp}

        </div>

        <div>

          <b>Lifetime VXP</b>

          <br />

          {profile.lifetime_vxp}

        </div>

        <div>

          <b>Referral Code</b>

          <br />

          {profile.referral_code}

        </div>

        <div>

          <b>Referred By</b>

          <br />

          {profile.referred_by ?? '-'}

        </div>

      </div>

    </div>

  )

}