import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Next.js's default image optimization doesn't work on static hosts,
  // so you must disable it for the build to succeed.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
