/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kamri/ui', '@kamri/lib'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig

