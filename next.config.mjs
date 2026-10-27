import { securityHeaderEntries } from './security-headers.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const hsts = process.env.VERCEL === '1'
    const entries = securityHeaderEntries({ hsts })
    return [
      {
        source: '/:path*',
        headers: entries,
      },
      {
        // Vercel defaults static assets to ACAO:*; this must come after /:path*
        source: '/_next/:path*',
        headers: entries,
      },
    ]
  },
  images: {
    domains: ['adcbeqbfyppayebyqlmw.supabase.co', 'sprintern.ai'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
