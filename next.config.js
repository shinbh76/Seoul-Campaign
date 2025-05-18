/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content-Security-Policy의 frame-ancestors 설정으로 특정 도메인에서 iframe 호출 허용
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://sungsu1914.cafe24.com;",
          },
          // 일부 구형 브라우저를 위한 비표준 설정 (표준 값은 아니지만 일부 환경에서 동작)
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
        ],
      },
      {
        // CSV 파일에 대한 캐시 제어 설정
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 