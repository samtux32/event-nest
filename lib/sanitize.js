/**
 * Sanitize user inputs to prevent XSS and injection attacks.
 */

/**
 * Escape HTML special characters — use for any user text going into HTML emails.
 */
export function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Strip HTML tags from user input — use for text fields stored in the database.
 * Preserves plain text content, removes all tags.
 */
export function stripHtml(str) {
  if (!str) return ''
  return String(str).replace(/<[^>]*>/g, '')
}

/**
 * Sanitize a plain text string: strip HTML tags and trim whitespace.
 */
export function sanitizeText(str) {
  if (!str) return ''
  return stripHtml(String(str)).trim()
}

/**
 * Sanitize a URL — only allow http/https protocols to prevent javascript: and data: URIs.
 */
export function sanitizeUrl(str) {
  if (!str) return ''
  const trimmed = String(str).trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

/**
 * Validate file extension against an allowlist.
 * Returns the lowercase extension if valid, null otherwise.
 */
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic', 'heif']
const DOC_EXTS = ['pdf', 'doc', 'docx', 'txt']
const ALL_ALLOWED_EXTS = [...IMAGE_EXTS, ...DOC_EXTS]

export function validateFileExtension(filename, allowedTypes = 'all') {
  if (!filename) return null
  const ext = String(filename).split('.').pop()?.toLowerCase()
  if (!ext) return null

  const allowed = allowedTypes === 'image' ? IMAGE_EXTS
    : allowedTypes === 'document' ? ALL_ALLOWED_EXTS
    : ALL_ALLOWED_EXTS

  return allowed.includes(ext) ? ext : null
}

/**
 * Sanitize an array of strings (e.g. keywords, categories).
 */
export function sanitizeStringArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(s => sanitizeText(s)).filter(Boolean)
}
