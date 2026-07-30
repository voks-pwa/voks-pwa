import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/useAuth"
import { saveReferralCode } from "@/lib/referralStorage"
import { handlePostLogin } from "@/features/auth/authService"

export function ReferralLandingPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!code) {
      navigate("/", { replace: true })
      return
    }

    saveReferralCode(code)

    if (user) {
      handlePostLogin(user).catch((err) =>
        console.error("[REFERRAL] post-login failed", err),
      )
      navigate("/more", { replace: true })
    } else {
      navigate("/login", { replace: true })
    }
  }, [code, user, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#bda752]" />
    </div>
  )
}
