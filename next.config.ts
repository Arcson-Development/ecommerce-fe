import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "6670",
      },
      {
        protocol: "http",
        hostname: "101.50.2.190",
        port: "6699",
      },
      {
        protocol: "https",
        hostname: "101.50.2.190",
      },
    ],
  },
};

export default nextConfig;
