/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  eslint: {
    dirs: ["app", "components", "hooks", "src", "types"]
  }
};

export default nextConfig;

