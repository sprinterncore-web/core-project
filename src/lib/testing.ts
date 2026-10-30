// Testing mode — bypass email validations on localhost / Vercel previews.
// REMOVE before public launch.

export function isTestingMode(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app')
  )
}

export const TESTING_MODE_AVAILABLE = true

/** Server/middleware: skip waitlist portal gate on local dev. */
export function isLocalDevHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/** Client: portal gate bypass only on localhost (not Vercel previews). */
export function isLocalDevClient(): boolean {
  if (typeof window === 'undefined') return false
  return isLocalDevHostname(window.location.hostname)
}
