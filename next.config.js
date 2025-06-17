/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Fast Refresh 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts']
  }
}

module.exports = nextConfig