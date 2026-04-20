/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8080/api/:path*',
      },
      {
        source: '/stream',
        destination: 'http://backend:8080/stream',
      },
    ];
  },
};

module.exports = nextConfig;
