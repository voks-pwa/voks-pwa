import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    // Avoid spamming refresh loop when DNS is flaky / offline on dev
    autoRefreshToken: typeof navigator === 'undefined' ? true : navigator.onLine,
    persistSession: true,
    detectSessionInUrl: false,
  },
})