import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/tingoheladosbucket/**',
      },
    ],
  },
}

module.exports = nextConfig