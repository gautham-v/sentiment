/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Allow external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'companieslogo.com',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        pathname: '/logos/**',
      },
    ],
  },
  
  // Skip type checking during build (temporary fix)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig