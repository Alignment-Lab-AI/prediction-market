/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://95.216.154.108:1317/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;