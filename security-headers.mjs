/**
 * Shared security headers for Next.js (next.config) and Vercel (vercel.json).
 * CSP is Report-Only first — switch key to Content-Security-Policy after reports are clean.
 * When you change CSP_REPORT_ONLY, mirror the value in vercel.json (JSON cannot import this file).
 */

export const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://sprintern.ai https://www.sprintern.ai",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
  "frame-src https://calendly.com https://*.calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

/** @param {{ hsts?: boolean }} [opts] */
export function securityHeaderEntries(opts = {}) {
  const { hsts = false } = opts
  /** @type {{ key: string, value: string }[]} */
  const entries = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
    {
      key: 'Content-Security-Policy-Report-Only',
      value: CSP_REPORT_ONLY,
    },
  ]
  if (hsts) {
    entries.unshift({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    })
  }
  return entries
}
