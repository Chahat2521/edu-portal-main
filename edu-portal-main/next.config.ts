import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: "c:/Users/Lenovo/Downloads/edu-portal-main/edu-portal-main",
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow up to 11MB uploads (10MB file + overhead)
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
