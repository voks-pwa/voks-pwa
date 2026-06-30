import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginGoogle } from '@/features/auth/authService'
import { saveReferralCode } from '@/lib/referralStorage'

export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // 1. LOGIKA MENANGKAP KODE REFERRAL DARI URL QUERY (?ref=...)
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')

    if (ref) {
      console.log('REFERRAL DETECTED', ref)
      saveReferralCode(ref)
    }

 console.log(
  'REF SAVED',
  ref
)

console.log(
  'LOCAL STORAGE',
  localStorage.getItem(
    'voks_referral_code'
  )
)
      
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center">
        {/* Logo / Ornamen Hiasan */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#bda752] text-2xl mb-5 shadow-inner">
          📻
        </div>

        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Selamat Datang</h1>
        <p className="mt-1.5 text-sm text-gray-400 font-medium max-w-xs">
          Login untuk masuk ke VOKS NEXT dan kumpulkan VXP harianmu!
        </p>

        <button
          onClick={loginGoogle}
          className="mt-8 w-full rounded-2xl bg-[#bda752] hover:bg-[#a69243] active:scale-98 py-4 px-6 font-bold text-white shadow-sm transition-all flex items-center justify-center gap-3 text-sm sm:text-base"
        >
          {/* Ikon G Google Sederhana */}
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.57-4.444 10.57-10.76 0-.72-.08-1.27-.17-1.666H12.24z" />
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  )
}