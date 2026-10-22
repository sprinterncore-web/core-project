/** Canonical production origin (also set NEXT_PUBLIC_SITE_URL in Vercel). */
export const PRODUCTION_SITE_URL = 'https://sprintern.ai'

/** Client-side redirect base for Supabase auth (signup, OAuth, magic links). */
export function getClientSiteUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
}
