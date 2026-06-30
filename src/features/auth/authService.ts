import { supabase } from '@/lib/supabase'

export async function loginGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
}

export async function logout() {
  await supabase.auth.signOut()
}