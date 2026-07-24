import DOMPurify from 'dompurify';

export function stripHtml(html: string) {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}