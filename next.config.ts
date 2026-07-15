import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
}

console.log('[build] DATABASE_URL set:', !!process.env.DATABASE_URL)
console.log('[build] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ?? 'NOT SET')

export default nextConfig
