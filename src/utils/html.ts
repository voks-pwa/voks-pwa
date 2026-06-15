export function stripHtml(html: string) {
  const cleaned = html.replace(
    /<script[\s\S]*?<\/script>/gi,
    ''
  )

  const div = document.createElement('div')

  div.innerHTML = cleaned

  return div.textContent || ''
}