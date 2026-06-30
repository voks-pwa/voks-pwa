export function parseExpiryDate(
  value?: string
) {
  if (!value) return null

  const match =
    value.match(
      /(\d{2})\/(\d{2})\/(\d{4})\s(\d{1,2}):(\d{2})\s(pm|am)/i
    )

  if (!match) return null

  let hour =
    Number(match[4])

  const minute =
    Number(match[5])

  const ampm =
    match[6].toLowerCase()

  if (
    ampm === 'pm' &&
    hour !== 12
  ) {
    hour += 12
  }

  if (
    ampm === 'am' &&
    hour === 12
  ) {
    hour = 0
  }

  return new Date(
    Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1]),
    hour,
    minute
  )
}