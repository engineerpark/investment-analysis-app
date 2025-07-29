/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 배포에 최적화된 설정
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Vercel 환경에서는 static export 사용하지 않음
  // output과 distDir 설정 제거로 기본 Next.js 빌드 사용
  experimental: {
    // 최신 Next.js 기능 활성화
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
}

module.exports = nextConfig