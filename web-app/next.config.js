/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_COMMAND_API_URL: process.env.COMMAND_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_QUERY_API_URL: process.env.QUERY_API_URL || 'http://localhost:3002',
  },
  async rewrites() {
    return [
      {
        source: '/api/command/:path*',
        destination: `${process.env.COMMAND_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
      {
        source: '/api/query/:path*',
        destination: `${process.env.QUERY_API_URL || 'http://localhost:3002'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
