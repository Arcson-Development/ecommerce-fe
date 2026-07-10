import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force webpack instead of Turbopack
  webpack: (config) => config,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
