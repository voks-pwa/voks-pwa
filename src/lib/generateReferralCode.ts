export function generateReferralCode() {
  return (
    'VOKS' +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  )
}