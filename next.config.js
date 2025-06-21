/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fast Refresh 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts']
  },
  // API 키 환경 변수를 클라이언트에 노출
  env: {
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
  }
}

module.exports = nextConfig