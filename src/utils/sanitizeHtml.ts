import DOMPurify from 'dompurify'

/** 门户公告富文本展示前 sanitize，防 XSS */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}
