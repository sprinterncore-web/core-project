/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['adcbeqbfyppayebyqlmw.supabase.co'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
