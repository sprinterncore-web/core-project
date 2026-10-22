/** @type {import('next').NextConfig} */
const nextConfig = {
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
