/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Match all API requests starting with /api/
        destination: "http://localhost:8000/:path*", // Proxy to backend
      },
    ];
  },
};

export default nextConfig;
