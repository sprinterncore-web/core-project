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
