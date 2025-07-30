/** @type {import('next').NextConfig} */
// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // protocol: 'https',
        hostname: process.env.NEXT_IMAGE_DOMAIN,
        // port: '',
        // pathname: '/sites/default/files/**',
      },
    ],
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
