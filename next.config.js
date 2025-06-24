/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Static export 경고 제거를 위한 설정
  output: 'export',
  distDir: 'dist',
  // 환경 변수는 Next.js가 자동으로 처리하므로 제거
  // 대신 .env.local과 .env.production 파일 사용
}

module.exports = nextConfig