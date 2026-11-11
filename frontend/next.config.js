/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    const apiTarget = (process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/+$/, '')
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
