/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
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
      }
    ],
  },
}

module.exports = nextConfig