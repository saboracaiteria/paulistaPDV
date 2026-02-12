import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/paulistaPDV',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
