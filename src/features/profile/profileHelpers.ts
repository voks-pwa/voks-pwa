export function calculateCompletion(
  profile: any
) {
  let score = 0

  if (profile?.display_name)
    score += 20

  if (profile?.avatar_url)
    score += 20

  if (profile?.birth_date)
    score += 20

  if (profile?.city)
    score += 20

  if (profile?.bio)
    score += 20

  return score
}