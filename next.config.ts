import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce memory usage for low-RAM environments
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  },
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
