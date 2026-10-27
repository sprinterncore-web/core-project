import { securityHeaderEntries } from './security-headers.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const hsts = process.env.VERCEL === '1'
    return [
      {
        source: '/:path*',
        headers: securityHeaderEntries({ hsts }),
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
