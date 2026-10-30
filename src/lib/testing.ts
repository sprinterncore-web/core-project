// Testing mode — localhost dev only (never Vercel previews or production).

export function isTestingMode(): boolean {
  if (process.env.NODE_ENV !== 'development') return false
  if (typeof window === 'undefined') return false
  return isLocalDevHostname(window.location.hostname)
}

/** True when the dev-only toggle is on and the host allows testing mode. */
export function isDevTestingActive(toggleEnabled: boolean): boolean {
  return toggleEnabled && isTestingMode()
}

export const TESTING_MODE_AVAILABLE =
  process.env.NODE_ENV === 'development'

/** Server/middleware: skip waitlist portal gate on local dev. */
export function isLocalDevHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/** Client: portal gate bypass only on localhost (not Vercel previews). */
export function isLocalDevClient(): boolean {
  if (typeof window === 'undefined') return false
  return isLocalDevHostname(window.location.hostname)
}
