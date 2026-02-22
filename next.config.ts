/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'xmoviescdn.online',
      },
      {
        protocol: 'https',
        hostname: '**.xhcdn.com',
      },
      {
        protocol: 'http',
        hostname: '**.xhcdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.xvideos-cdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.phncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'gegdnoqjglidnijpmhay.supabase.co',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/media-proxy/:path*',
        destination: 'https://pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev/:path*',
      },
      {
        source: '/capturas-proxy/:path*',
        destination: 'https://pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev/:path*',
      },
      {
        source: '/image-proxy/:path*',
        destination: 'https://xmoviescdn.online/:path*',
      },
    ]
  },
}

module.exports = nextConfig