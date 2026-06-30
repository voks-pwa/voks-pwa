export function saveReferralCode(
  code: string
) {
  localStorage.setItem(
    'voks_referral_code',
    code
  )
}

export function getReferralCode() {
  return localStorage.getItem(
    'voks_referral_code'
  )
}

export function clearReferralCode() {
  localStorage.removeItem(
    'voks_referral_code'
  )
}